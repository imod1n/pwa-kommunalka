from bson import ObjectId
from .database import db
from .models import PaymentCreate


def _fmt(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc.setdefault("object_name", "")
    doc.setdefault("period", doc.get("date", "")[:7])  # fallback for old docs
    doc.setdefault("note", "")
    return doc


async def create_payment(data: PaymentCreate) -> dict:
    doc = data.model_dump()
    result = await db.payments.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _fmt(doc)


async def get_payments(limit: int = 200) -> list:
    cursor = db.payments.find().sort("date", -1).limit(limit)
    return [_fmt(d) async for d in cursor]


async def delete_payment(payment_id: str) -> bool:
    result = await db.payments.delete_one({"_id": ObjectId(payment_id)})
    return result.deleted_count == 1


async def get_stats_by_period(period: str) -> dict:
    """
    period = YYYY-MM
    Returns: total, by_category, by_object
    """
    cursor = db.payments.find({"period": period})
    docs = [_fmt(d) async for d in cursor]

    total = sum(d["amount"] for d in docs)

    by_category: dict[str, float] = {}
    by_object: dict[str, list] = {}

    for d in docs:
        # by category
        by_category[d["category"]] = by_category.get(d["category"], 0) + d["amount"]

        # by object → list of payment rows
        obj = d["object_name"] or "Без объекта"
        if obj not in by_object:
            by_object[obj] = []
        by_object[obj].append({
            "category":  d["category"],
            "date":      d["date"],
            "period":    d["period"],
            "amount":    d["amount"],
            "note":      d["note"],
        })

    return {
        "period":      period,
        "total":       total,
        "by_category": by_category,
        "by_object":   by_object,
    }


async def get_stats_history(months: int = 6) -> list:
    """Last N months aggregated by period field."""
    pipeline = [
        {"$group": {
            "_id":   "$period",
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": -1}},
        {"$limit": months},
        {"$project": {"period": "$_id", "total": 1, "count": 1, "_id": 0}},
    ]
    cursor = db.payments.aggregate(pipeline)
    return [d async for d in cursor]
