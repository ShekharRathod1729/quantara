import numpy as np
from numba import jit

'''
Calculating the lower triangular matrix L in the Cholesky decomposition of A (A = LL^{T}).
A: ndarray
Returns L.
'''
@jit
def cholesky(A):
    
    n = np.shape(A)[0]
    L = np.zeros_like(A)

    for i in range(n):
        for j in range(i + 1):
            if i == j:
                L[j, j] = np.sqrt(A[j, j] - np.dot(L[j, :j], L[j, :j]))

            if i > j:
                L[i, j] = (A[i, j] - np.dot(L[i, :j], L[j, :j])) / L[j, j]

    return L


'''
Calculating the covariance matrix of a given matrix A.
A: ndarray
Returns the covariance matrix C.
'''

def cov(A):
    k, N = A.shape
    C = np.zeros((k, k))

    mean = np.mean(A, axis=1)  # stores the mean of each row of A (axis=1 takes the mean along the rows)
    
    A_c = A - mean[:, None]  # centered matrix
    C = (A_c @ A_c.T) / (N - 1)  

    return C
