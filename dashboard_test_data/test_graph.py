import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

# Example data (Replace with API response data)
mean = 75.2
standard_deviation = 12.5
min_score = 40
max_score = 100
total = 500

# Generate x-axis values (range of scores)
x = np.linspace(min_score, max_score, 1000)

# Calculate the probability density function (PDF)
pdf = norm.pdf(x, mean, standard_deviation)

# Plot the normal distribution
plt.figure(figsize=(10, 6))
plt.plot(x, pdf, label="Normal Distribution", color="blue")

# Highlight percentiles for visual representation
percentiles = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
for p in percentiles:
    score_at_percentile = norm.ppf(p / 100, mean, standard_deviation)
    plt.axvline(score_at_percentile, color="gray", linestyle="--", alpha=0.7)
    plt.text(
        score_at_percentile,
        0.01,
        f"{p}%",
        rotation=90,
        verticalalignment="bottom",
        fontsize=8,
        color="black",
    )

# Add labels and title
plt.title("Normal Distribution of Scores", fontsize=16)
plt.xlabel("Score", fontsize=12)
plt.ylabel("Probability Density", fontsize=12)
plt.legend()
plt.grid(alpha=0.3)

# Show the plot
plt.show()