import os
import time
import MySQLdb

HOST = os.getenv("DATABASE_HOST", "mysql")
USER = os.getenv("DATABASE_USER", "root")
PASSWORD = os.getenv("DATABASE_PASSWORD", "")
PORT = int(os.getenv("DATABASE_PORT", "3306"))
DBNAME = os.getenv("DATABASE_NAME")  # puede ser None

def is_ready():
    try:
        conn = MySQLdb.connect(
            host=HOST,
            user=USER,
            passwd=PASSWORD,
            port=PORT,
            db=DBNAME or "",            # si no hay DB, intentamos sin nombre
            connect_timeout=2,
        )
        conn.close()
        return True
    except MySQLdb.OperationalError as e:
        code = e.args[0] if e.args else None
        # 1049 = Unknown database: el host ya responde; consideramos "suficientemente listo"
        if code == 1049:
            return True
        return False
    except Exception:
        return False

retries = 60  # ~120s
for i in range(retries):
    if is_ready():
        print("Database is reachable.")
        break
    print("Waiting for database...", f"({i+1}/{retries})")
    time.sleep(2)
else:
    raise SystemExit("DB not ready after timeout")
