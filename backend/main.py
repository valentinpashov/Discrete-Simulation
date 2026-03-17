from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import simpy
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Mensa:
    def __init__(self, env, num_cookers, num_cashiers, seating_capacity):
        self.env = env
        self.cookers = simpy.Resource(env, capacity=num_cookers)
        self.cashiers = simpy.Resource(env, capacity=num_cashiers)
        self.seating = simpy.Resource(env, capacity=seating_capacity)
        self.total_stay_times = []
        self.cook_times = []
        self.check_times = []
        self.dine_times = []

    def order_food(self, customer):
        duration = np.random.exponential(5)
        yield self.env.timeout(duration)
        return duration

    def checkout(self, customer):
        duration = np.random.triangular(2, 3, 4)
        yield self.env.timeout(duration)
        return duration

    def dine(self, customer):
        duration = np.random.normal(20, 5)
        yield self.env.timeout(duration)
        return duration

def customer_process(env, name, mensa):
    arrival_time = env.now

    with mensa.cookers.request() as cooker:
        yield cooker
        t = yield env.process(mensa.order_food(name))
        mensa.cook_times.append(t)

    with mensa.cashiers.request() as cashier:
        yield cashier
        t = yield env.process(mensa.checkout(name))
        mensa.check_times.append(t)

    with mensa.seating.request() as seat:
        yield seat
        t = yield env.process(mensa.dine(name))
        mensa.dine_times.append(t)
    
    mensa.total_stay_times.append(env.now - arrival_time)

def student_generator(env, students_count, mensa):
    for i in range(students_count):
        yield env.timeout(np.random.exponential(1.5))
        env.process(customer_process(env, f'Student {i}', mensa))

@app.get("/simulate")
def run_simulation(time: int, students: int, cashiers: int, cookers: int, seats: int):
    env = simpy.Environment()
    mensa = Mensa(env, cookers, cashiers, seats)
    env.process(student_generator(env, students, mensa))
    env.run(until=time)
    
    return {
        "average_wait": round(float(np.mean(mensa.total_stay_times)), 2) if mensa.total_stay_times else 0,
        "total_students": len(mensa.total_stay_times),
        "breakdown": {
            "cooking": round(float(np.mean(mensa.cook_times)), 2) if mensa.cook_times else 0,
            "checkout": round(float(np.mean(mensa.check_times)), 2) if mensa.check_times else 0,
            "dining": round(float(np.mean(mensa.dine_times)), 2) if mensa.dine_times else 0,
        }
    }