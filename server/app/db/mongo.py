from pymongo import MongoClient
from pymongo.server_api import ServerApi

_client = None

def init_mongo(app):
    """
    Creates a MongoClient and stores it on app.extensions.
    """
    global _client
    uri = app.config.get("MONGO_URI")
    # print(uri)
    if not uri:
        raise RuntimeError("MONGO_URI is missing. Set it in .env")

    _client = MongoClient(uri, server_api=ServerApi("1"))
    app.extensions["mongo_client"] = _client

def get_db(app):
    """
    Returns the configured database handle.
    """
    client = app.extensions.get("mongo_client")
    if client is None:
        raise RuntimeError("Mongo client not initialized. Did you call init_mongo?")
    db_name = app.config.get("MONGO_DB_NAME")
    return client[db_name]
