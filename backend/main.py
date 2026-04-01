"""
Deia's Trainer - Backend API
FastAPI server with SQLite database
"""

import os
import base64
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Boolean,
    JSON,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import openai

SECRET_KEY = os.getenv("SECRET_KEY", "deia-trainer-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./deia_trainer.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    nickname = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True)
    age = Column(Integer, nullable=True)
    fitness_goals = Column(Text, nullable=True)
    dietary_preferences = Column(Text, nullable=True)
    language = Column(String, default="pt")
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    health_notes = Column(Text, nullable=True)


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    role = Column(String)
    content = Column(Text)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Memory(Base):
    __tablename__ = "memories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    exercise_type = Column(String)
    duration_minutes = Column(Integer)
    intensity = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    meal_type = Column(String)
    description = Column(Text)
    calories_estimate = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Weight(Base):
    __tablename__ = "weights"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    weight_kg = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class Water(Base):
    __tablename__ = "water"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount_ml = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    time = Column(String)
    message = Column(Text)
    enabled = Column(Boolean, default=True)
    days = Column(JSON, default=[0, 1, 2, 3, 4, 5, 6])
    notification_type = Column(String, default="reminder")


Base.metadata.create_all(bind=engine)


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    nickname: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    fitness_goals: Optional[str] = None
    dietary_preferences: Optional[str] = None
    language: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    health_notes: Optional[str] = None


class ChatMessage(BaseModel):
    message: str


class ExerciseCreate(BaseModel):
    exercise_type: str
    duration_minutes: int
    intensity: Optional[str] = None
    notes: Optional[str] = None


class MealCreate(BaseModel):
    meal_type: str
    description: str
    calories_estimate: Optional[int] = None


class WeightCreate(BaseModel):
    weight_kg: float


class WaterCreate(BaseModel):
    amount_ml: int


class NotificationCreate(BaseModel):
    time: str
    message: str
    days: List[int] = [0, 1, 2, 3, 4, 5, 6]
    notification_type: str = "reminder"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def count_tokens(text: str) -> int:
    return len(text) // 4


CARLOS_SYSTEM_PROMPT = """Você é Carlos, um personal trainer e nutricionista brasileiro do Rio de Janeiro. 
Você é cálido, amigável, paciente e muito atencioso. Você trata a usuário (Deia) como uma amiga querida e a motiva diariamente.

Sua missão é:
1. Ajudar com exercícios e rotinas de fitness
2. Orientar sobre nutrição e refeições saudáveis
3. Dar motivação e apoio emocional
4. Manter conversas amigáveis
5. Lembrar de detalhes sobre Deia (sua vida, preferências, objetivos)

Você deve:
- Usar português brasileiro chaleureux
- Ser encorajador e positivo
- Fazer perguntas sobre o bem-estar de Deia
- Oferecer sugestões personalizadas
- Lembrar conversas anteriores

Estilo de comunicação:
- Linguagem casual e amigável
- Uso de emojis calorosos
- Mensagens motivadoras
- Perguntas abertas para manter conversa"""


app = FastAPI(title="Deia's Trainer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name,
        nickname=user_data.nickname,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(user_id=user.id)
    db.add(profile)

    memory = Memory(user_id=user.id, summary="")
    db.add(memory)
    db.commit()

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@app.get("/user/profile")
def get_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "nickname": current_user.nickname,
        "age": profile.age if profile else None,
        "fitness_goals": profile.fitness_goals if profile else None,
        "dietary_preferences": profile.dietary_preferences if profile else None,
        "language": profile.language if profile else "pt",
        "weight_kg": profile.weight_kg if profile else None,
        "height_cm": profile.height_cm if profile else None,
        "health_notes": profile.health_notes if profile else None,
    }


@app.put("/user/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if profile_data.age is not None:
        profile.age = profile_data.age
    if profile_data.fitness_goals is not None:
        profile.fitness_goals = profile_data.fitness_goals
    if profile_data.dietary_preferences is not None:
        profile.dietary_preferences = profile_data.dietary_preferences
    if profile_data.language is not None:
        profile.language = profile_data.language
    if profile_data.weight_kg is not None:
        profile.weight_kg = profile_data.weight_kg
    if profile_data.height_cm is not None:
        profile.height_cm = profile_data.height_cm
    if profile_data.health_notes is not None:
        profile.health_notes = profile_data.health_notes

    db.commit()
    return {"message": "Profile updated successfully"}


@app.put("/user/name")
def update_name(
    name_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "nickname" in name_data:
        current_user.nickname = name_data["nickname"]
    if "name" in name_data:
        current_user.name = name_data["name"]
    db.commit()
    return {"message": "Name updated successfully"}


@app.post("/agent/chat")
def chat(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    memory = db.query(Memory).filter(Memory.user_id == current_user.id).first()

    recent_messages = (
        db.query(Message)
        .filter(Message.user_id == current_user.id)
        .order_by(Message.created_at.desc())
        .limit(20)
        .all()
    )

    messages = []

    if memory and memory.summary:
        messages.append(
            {"role": "system", "content": f"Lembrando sobre Deia: {memory.summary}"}
        )

    messages.append({"role": "system", "content": CARLOS_SYSTEM_PROMPT})

    user_info = f"O nome dela é {current_user.name}"
    if current_user.nickname:
        user_info += f", mas ela prefere ser chamada de {current_user.nickname}"
    if profile and profile.fitness_goals:
        user_info += f". Seus objetivos de fitness: {profile.fitness_goals}"
    if profile and profile.dietary_preferences:
        user_info += f". Preferências alimentares: {profile.dietary_preferences}"

    messages.append({"role": "system", "content": user_info})

    for msg in reversed(recent_messages):
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": chat_message.message})

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o", messages=messages, max_tokens=500, temperature=0.8
        )
        assistant_response = response.choices[0].message.content
    except Exception as e:
        assistant_response = (
            f"Desculpe, tive um problema ao responder. Tente novamente. Erro: {str(e)}"
        )

    user_msg = Message(
        user_id=current_user.id, role="user", content=chat_message.message
    )
    db.add(user_msg)

    assistant_msg = Message(
        user_id=current_user.id, role="assistant", content=assistant_response
    )
    db.add(assistant_msg)
    db.commit()

    total_tokens = 0
    for msg in db.query(Message).filter(Message.user_id == current_user.id).all():
        total_tokens += count_tokens(msg.content)

    if total_tokens > 12000:
        all_messages = (
            db.query(Message).filter(Message.user_id == current_user.id).all()
        )
        summary_text = "\n".join(
            [f"{msg.role}: {msg.content[:200]}" for msg in all_messages[-50:]]
        )

        summary_messages = [
            {
                "role": "system",
                "content": "Resuma as informações importantes sobre a usuário em um parágrafo conciso.",
            },
            {"role": "user", "content": summary_text},
        ]

        try:
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            summary_response = client.chat.completions.create(
                model="gpt-4o", messages=summary_messages, max_tokens=300
            )
            new_summary = summary_response.choices[0].message.content

            if memory:
                memory.summary = new_summary
                memory.updated_at = datetime.utcnow()
            else:
                memory = Memory(user_id=current_user.id, summary=new_summary)
                db.add(memory)

            old_messages = (
                db.query(Message)
                .filter(Message.user_id == current_user.id)
                .order_by(Message.created_at.asc())
                .limit(-10)
                .all()
            )

            for msg in old_messages[:-10]:
                db.delete(msg)

            db.commit()
        except:
            pass

    return {"response": assistant_response}


@app.post("/agent/chat/image")
async def chat_with_image(
    message: str,
    current_user: User = Depends(get_current_user),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    memory = db.query(Memory).filter(Memory.user_id == current_user.id).first()

    messages = []

    if memory and memory.summary:
        messages.append(
            {"role": "system", "content": f"Lembrando sobre Deia: {memory.summary}"}
        )

    messages.append({"role": "system", "content": CARLOS_SYSTEM_PROMPT})

    user_info = f"O nome dela é {current_user.name}"
    if current_user.nickname:
        user_info += f", mas ela prefere ser chamada de {current_user.nickname}"
    messages.append({"role": "system", "content": user_info})

    image_content = None
    if image:
        image_data = await image.read()
        image_base64 = base64.b64encode(image_data).decode("utf-8")
        image_content = f"data:image/jpeg;base64,{image_base64}"
        messages.append(
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": message},
                    {"type": "image_url", "image_url": {"url": image_content}},
                ],
            }
        )
    else:
        messages.append({"role": "user", "content": message})

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o", messages=messages, max_tokens=500, temperature=0.8
        )
        assistant_response = response.choices[0].message.content
    except Exception as e:
        assistant_response = (
            f"Desculpe, tive um problema ao analisar a imagem. Erro: {str(e)}"
        )

    user_msg = Message(user_id=current_user.id, role="user", content=message)
    db.add(user_msg)

    assistant_msg = Message(
        user_id=current_user.id, role="assistant", content=assistant_response
    )
    db.add(assistant_msg)
    db.commit()

    return {"response": assistant_response}


@app.get("/agent/memory/status")
def get_memory_status(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(Message.user_id == current_user.id).all()
    memory = db.query(Memory).filter(Memory.user_id == current_user.id).first()

    total_tokens = sum(count_tokens(msg.content) for msg in messages)

    return {
        "message_count": len(messages),
        "total_tokens": total_tokens,
        "has_memory": bool(memory and memory.summary),
        "memory_summary": memory.summary if memory else None,
    }


@app.post("/agent/memory/compact")
def compact_memory(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    all_messages = db.query(Message).filter(Message.user_id == current_user.id).all()

    if not all_messages:
        return {"message": "Nenhuma mensagem para compactar"}

    summary_text = "\n".join(
        [f"{msg.role}: {msg.content[:300]}" for msg in all_messages[-100:]]
    )

    summary_messages = [
        {
            "role": "system",
            "content": "Resuma as informações importantes sobre a usuário em um parágrafo conciso.",
        },
        {"role": "user", "content": summary_text},
    ]

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o", messages=summary_messages, max_tokens=300
        )
        new_summary = response.choices[0].message.content

        memory = db.query(Memory).filter(Memory.user_id == current_user.id).first()
        if memory:
            memory.summary = new_summary
            memory.updated_at = datetime.utcnow()
        else:
            memory = Memory(user_id=current_user.id, summary=new_summary)
            db.add(memory)

        for msg in all_messages[:-10]:
            db.delete(msg)

        db.commit()
        return {"message": "Memória compactada com sucesso", "summary": new_summary}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao compactar memória: {str(e)}"
        )


@app.post("/data/exercise")
def log_exercise(
    exercise: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_exercise = Exercise(
        user_id=current_user.id,
        exercise_type=exercise.exercise_type,
        duration_minutes=exercise.duration_minutes,
        intensity=exercise.intensity,
        notes=exercise.notes,
    )
    db.add(new_exercise)
    db.commit()
    return {"message": "Exercício registrado com sucesso", "id": new_exercise.id}


@app.get("/data/exercises")
def get_exercises(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    exercises = (
        db.query(Exercise)
        .filter(Exercise.user_id == current_user.id)
        .order_by(Exercise.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": e.id,
            "exercise_type": e.exercise_type,
            "duration_minutes": e.duration_minutes,
            "intensity": e.intensity,
            "notes": e.notes,
            "created_at": e.created_at.isoformat(),
        }
        for e in exercises
    ]


@app.post("/data/meal")
def log_meal(
    meal: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_meal = Meal(
        user_id=current_user.id,
        meal_type=meal.meal_type,
        description=meal.description,
        calories_estimate=meal.calories_estimate,
    )
    db.add(new_meal)
    db.commit()
    return {"message": "Refeição registrada com sucesso", "id": new_meal.id}


@app.get("/data/meals")
def get_meals(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id)
        .order_by(Meal.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": m.id,
            "meal_type": m.meal_type,
            "description": m.description,
            "calories_estimate": m.calories_estimate,
            "created_at": m.created_at.isoformat(),
        }
        for m in meals
    ]


@app.post("/data/weight")
def log_weight(
    weight: WeightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_weight = Weight(user_id=current_user.id, weight_kg=weight.weight_kg)
    db.add(new_weight)
    db.commit()

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.weight_kg = weight.weight_kg
        db.commit()

    return {"message": "Peso registrado com sucesso", "id": new_weight.id}


@app.get("/data/weight")
def get_weights(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    weights = (
        db.query(Weight)
        .filter(Weight.user_id == current_user.id)
        .order_by(Weight.created_at.desc())
        .limit(30)
        .all()
    )

    return [
        {"id": w.id, "weight_kg": w.weight_kg, "created_at": w.created_at.isoformat()}
        for w in weights
    ]


@app.post("/data/water")
def log_water(
    water: WaterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_water = Water(user_id=current_user.id, amount_ml=water.amount_ml)
    db.add(new_water)
    db.commit()
    return {"message": "Água registrada com sucesso", "id": new_water.id}


@app.get("/data/water/today")
def get_today_water(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()
    waters = (
        db.query(Water)
        .filter(Water.user_id == current_user.id, Water.created_at >= today)
        .all()
    )

    total_ml = sum(w.amount_ml for w in waters)
    return {"total_ml": total_ml, "glasses": total_ml // 250}


@app.post("/notifications/schedule")
def schedule_notification(
    notification: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_notification = Notification(
        user_id=current_user.id,
        time=notification.time,
        message=notification.message,
        enabled=True,
        days=notification.days,
        notification_type=notification.notification_type,
    )
    db.add(new_notification)
    db.commit()
    return {"message": "Notificação agendada com sucesso", "id": new_notification.id}


@app.get("/notifications/schedule")
def get_notifications(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    notifications = (
        db.query(Notification).filter(Notification.user_id == current_user.id).all()
    )

    return [
        {
            "id": n.id,
            "time": n.time,
            "message": n.message,
            "enabled": n.enabled,
            "days": n.days,
            "notification_type": n.notification_type,
        }
        for n in notifications
    ]


@app.delete("/notifications/schedule/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")

    db.delete(notification)
    db.commit()
    return {"message": "Notificação excluída com sucesso"}


@app.put("/notifications/schedule/{notification_id}")
def toggle_notification(
    notification_id: int,
    enabled: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")

    notification.enabled = enabled
    db.commit()
    return {"message": "Notificação atualizada"}


@app.get("/stats/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()

    today_exercises = (
        db.query(Exercise)
        .filter(Exercise.user_id == current_user.id, Exercise.created_at >= today)
        .all()
    )

    today_meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id, Meal.created_at >= today)
        .all()
    )

    today_water = (
        db.query(Water)
        .filter(Water.user_id == current_user.id, Water.created_at >= today)
        .all()
    )
    total_water = sum(w.amount_ml for w in today_water)

    latest_weight = (
        db.query(Weight)
        .filter(Weight.user_id == current_user.id)
        .order_by(Weight.created_at.desc())
        .first()
    )

    all_exercises = (
        db.query(Exercise)
        .filter(Exercise.user_id == current_user.id)
        .order_by(Exercise.created_at.desc())
        .all()
    )

    streak = 0
    if all_exercises:
        current_date = today
        for ex in all_exercises:
            ex_date = ex.created_at.date()
            if ex_date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            elif ex_date < current_date:
                break

    week_ago = today - timedelta(days=7)
    weekly_exercises = (
        db.query(Exercise)
        .filter(Exercise.user_id == current_user.id, Exercise.created_at >= week_ago)
        .all()
    )

    weekly_meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id, Meal.created_at >= week_ago)
        .all()
    )

    return {
        "today": {
            "exercises_count": len(today_exercises),
            "exercises_minutes": sum(e.duration_minutes for e in today_exercises),
            "meals_count": len(today_meals),
            "water_ml": total_water,
            "water_glasses": total_water // 250,
        },
        "weight_kg": latest_weight.weight_kg if latest_weight else None,
        "streak_days": streak,
        "weekly": {
            "exercises_count": len(weekly_exercises),
            "exercises_minutes": sum(e.duration_minutes for e in weekly_exercises),
            "meals_count": len(weekly_meals),
        },
    }


@app.get("/")
def root():
    return {"message": "Deia's Trainer API is running!", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
