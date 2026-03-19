import numpy as np
from numba import jit

'''
Calculating the risk-neutral probability p
r: risk-free rate
dt: length of each time step (in years)
u: calculated by calc_u
'''

def calc_p(r, dt, u):
    d = 1 / u
    return (np.exp(r * dt) - d) / (u - d)


'''
Calculating the binomial tree for simulating stock prices.
S0: current stock price
u: up factor
N: number of time periods
'''

@jit
def stock_bt(S0, u, N):
    d = 1 / u
    S = np.zeros((N + 1, N + 1))
    S[0, 0] = S0

    for t in range(1, N + 1):
        for i in range(t):
            S[i, t] = u * S[i, t - 1]
            S[i + 1, t] = d * S[i, t - 1]

    return S   
