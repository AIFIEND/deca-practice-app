export type Question = {
  id: number
  stem: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: string
  explanation: string
  category: string
}

export const questions: Question[] = [
  {
    id: 1,
    stem: "A retail store manager notices that sales of a particular product line have decreased by 15% over the past quarter. What should be the manager's first step in addressing this issue?",
    options: {
      A: "Immediately discontinue the product line",
      B: "Analyze sales data to identify potential causes",
      C: "Increase advertising for the product line",
      D: "Reduce the price of the products",
    },
    correctAnswer: "B",
    explanation:
      "The first step should be to analyze the sales data to understand why sales have decreased. This allows the manager to make an informed decision based on evidence rather than assumptions.",
    category: "Marketing",
  },
  {
    id: 2,
    stem: "Which of the following is an example of a fixed cost for a restaurant?",
    options: {
      A: "Cost of ingredients",
      B: "Server wages based on hours worked",
      C: "Monthly rent payment",
      D: "Utility bills that vary with usage",
    },
    correctAnswer: "C",
    explanation:
      "Monthly rent is a fixed cost because it remains constant regardless of the restaurant's sales volume or activity level.",
    category: "Finance",
  },
  {
    id: 3,
    stem: "A company is considering expanding into a new market. Which of the following would be MOST important to include in their market analysis?",
    options: {
      A: "The CEO's personal preference",
      B: "Competitor presence and market share",
      C: "The company's previous year's profit margin",
      D: "The number of employees currently working for the company",
    },
    correctAnswer: "B",
    explanation:
      "Understanding competitor presence and market share is crucial when expanding into a new market as it helps identify potential challenges and opportunities.",
    category: "Marketing",
  },
  {
    id: 4,
    stem: "What is the primary purpose of a business's mission statement?",
    options: {
      A: "To list the company's products and services",
      B: "To outline the company's financial goals",
      C: "To communicate the company's purpose and values",
      D: "To describe the company's organizational structure",
    },
    correctAnswer: "C",
    explanation:
      "A mission statement communicates the company's purpose, values, and reason for existence to stakeholders, guiding decision-making and establishing the company's identity.",
    category: "Management",
  },
  {
    id: 5,
    stem: "A retail store is experiencing high employee turnover. Which of the following strategies would MOST likely help address this issue?",
    options: {
      A: "Reducing store hours",
      B: "Implementing an employee recognition program",
      C: "Increasing product prices",
      D: "Changing the store layout",
    },
    correctAnswer: "B",
    explanation:
      "Implementing an employee recognition program can improve job satisfaction and motivation, which often leads to reduced turnover as employees feel valued and appreciated.",
    category: "Human Resources",
  },
  {
    id: 6,
    stem: "Which pricing strategy involves setting a high initial price for a new product and then gradually reducing it over time?",
    options: {
      A: "Penetration pricing",
      B: "Price skimming",
      C: "Competitive pricing",
      D: "Cost-plus pricing",
    },
    correctAnswer: "B",
    explanation:
      "Price skimming involves setting a high initial price for a new product to capture customers willing to pay premium prices, then gradually lowering the price to attract more price-sensitive customers.",
    category: "Marketing",
  },
  {
    id: 7,
    stem: "A company wants to determine if its new advertising campaign is effective. Which of the following metrics would be MOST useful?",
    options: {
      A: "The number of employees in the marketing department",
      B: "The company's total revenue from all product lines",
      C: "Sales figures before and after the campaign for the advertised products",
      D: "The CEO's opinion of the advertisement",
    },
    correctAnswer: "C",
    explanation:
      "Comparing sales figures before and after the campaign provides objective data about whether the advertising campaign increased sales of the advertised products.",
    category: "Marketing",
  },
  {
    id: 8,
    stem: "Which of the following is an example of a business-to-business (B2B) transaction?",
    options: {
      A: "A consumer purchasing a laptop from an electronics store",
      B: "A restaurant buying ingredients from a food supplier",
      C: "A student buying textbooks for school",
      D: "A family purchasing tickets to a movie",
    },
    correctAnswer: "B",
    explanation:
      "A restaurant buying ingredients from a food supplier is a B2B transaction because it involves one business (the restaurant) purchasing from another business (the food supplier).",
    category: "Marketing",
  },
  {
    id: 9,
    stem: "What is the primary purpose of a SWOT analysis?",
    options: {
      A: "To determine employee salaries",
      B: "To evaluate a company's Strengths, Weaknesses, Opportunities, and Threats",
      C: "To calculate profit margins",
      D: "To design marketing materials",
    },
    correctAnswer: "B",
    explanation:
      "A SWOT analysis helps businesses identify their internal Strengths and Weaknesses, as well as external Opportunities and Threats, to inform strategic planning and decision-making.",
    category: "Management",
  },
  {
    id: 10,
    stem: "A retail store manager is analyzing the store's inventory turnover ratio. What does a high inventory turnover ratio typically indicate?",
    options: {
      A: "The store has excess inventory that isn't selling",
      B: "The store is efficiently selling its inventory",
      C: "The store needs to increase its prices",
      D: "The store should order more inventory immediately",
    },
    correctAnswer: "B",
    explanation:
      "A high inventory turnover ratio typically indicates that the store is efficiently selling its inventory, which is generally positive as it means less capital is tied up in inventory and products aren't becoming obsolete.",
    category: "Finance",
  },
]
