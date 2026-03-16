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
        self.wait_times = []

    def order_food(self, customer):
        start_time = self.env.now

        yield self.env.timeout(np.random.exponential(5))
        self.wait_times.append(self.env.now - start_time)

    def checkout(self, customer):
        start_time = self.env.now
        
        yield self.env.timeout(np.random.triangular(2, 3, 4))
        self.wait_times.append(self.env.now - start_time)

    def dine(self, customer):
        start_time = self.env.now
        
        yield self.env.timeout(np.random.normal(20, 5))
        self.wait_times.append(self.env.now - start_time)

def customer_process(env, name, mensa):
    with mensa.cookers.request() as cooker:
        yield cooker
        yield env.process(mensa.order_food(name))

    with mensa.cashiers.request() as cashier:
        yield cashier
        yield env.process(mensa.checkout(name))

    with mensa.seating.request() as seat:
        yield seat
        yield env.process(mensa.dine(name))

@app.get("/simulate")
def run_simulation(time: int, students: int, cashiers: int, cookers: int, seats: int):
    env = simpy.Environment()
    mensa = Mensa(env, cookers, cashiers, seats)
    
    for i in range(students):
        env.process(customer_process(env, f'Student {i}', mensa))

    env.run(until=time)
    avg_wait = np.mean(mensa.wait_times) if mensa.wait_times else 0
    
    return {
        "average_wait": round(float(avg_wait), 2),
        "total_operations": len(mensa.wait_times),
        "total_students": students,
        "completion_time": env.now
    }