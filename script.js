/* =========================================================
   SMALL BUSINESS FINANCE & CASH FLOW SYSTEM
   Nexora Technologies
   Interactive Financial Engine
   ========================================================= */

"use strict";

/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const STORAGE_KEY = "nexoraSmallBusinessFinanceData";

/*
  Add the final Selar checkout URL here when the product
  is published on Selar.

  Example:
  const CHECKOUT_URL = "https://selar.com/your-product-link";
*/
const CHECKOUT_URL = "";


/* =========================================================
   2. DEFAULT APPLICATION DATA
   ========================================================= */

const DEFAULT_DATA = {
  income: [],
  expenses: [],

  cashFlow: {
    openingBalance: 0,
    projectedInflows: 0,
    projectedOutflows: 0
  },

  profitability: {
    revenue: 0,
    costOfGoods: 0,
    operatingExpenses: 0
  }
};


/* =========================================================
   3. GLOBAL STATE
   ========================================================= */

let financeData = loadData();


/* =========================================================
   4. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});


/* =========================================================
   5. INITIALIZE APPLICATION
   ========================================================= */

function initializeApplication() {
  setupNavigation();
  setupIncomeForm();
  setupExpenseForm();
  setupCashFlowForm();
  setupProfitabilityForm();
  setupResetButtons();
  setupFAQ();
  setupCheckout();

  restoreForms();
  renderIncomeTable();
  renderExpenseTable();
  updateDashboard();
  updateCashFlow();
  updateProfitability();
  drawCashFlowChart();
  drawPerformanceChart();
}


/* =========================================================
   6. STORAGE
   ========================================================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DATA);
    }

    const parsed = JSON.parse(saved);

    return {
      income: Array.isArray(parsed.income) ? parsed.income : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],

      cashFlow: {
        ...DEFAULT_DATA.cashFlow,
        ...(parsed.cashFlow || {})
      },

      profitability: {
        ...DEFAULT_DATA.profitability,
        ...(parsed.profitability || {})
      }
    };
  } catch (error) {
    console.error("Unable to load saved financial data:", error);
    return structuredClone(DEFAULT_DATA);
  }
}


function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(financeData)
    );

    showSaveStatus("Financial data saved");
  } catch (error) {
    console.error("Unable to save financial data:", error);
  }
}


function clearSavedData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear saved data:", error);
  }
}


/* =========================================================
   7. HELPER FUNCTIONS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function formatMoney(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}


function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}


function getNumber(id) {
  const element = $(id);

  if (!element) return 0;

  const value = parseFloat(element.value);

  return Number.isFinite(value) ? value : 0;
}


function getInputValue(id) {
  const element = $(id);

  return element ? element.value.trim() : "";
}


function setInputValue(id, value) {
  const element = $(id);

  if (element) {
    element.value = value ?? "";
  }
}


function todayISO() {
  return new Date().toISOString().split("T")[0];
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showSaveStatus(message) {
  const elements = document.querySelectorAll(
    ".save-status, #save-status, [data-save-status]"
  );

  elements.forEach((element) => {
    element.textContent = message;

    element.classList.add("visible");

    clearTimeout(element._saveTimer);

    element._saveTimer = setTimeout(() => {
      element.classList.remove("visible");
    }, 2200);
  });
}


/* =========================================================
   8. NAVIGATION
   ========================================================= */

function setupNavigation() {
  const links = document.querySelectorAll(
    'a[href^="#"]'
  );

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetID = link.getAttribute("href");

      if (!targetID || targetID === "#") return;

      const target = document.querySelector(targetID);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}


/* =========================================================
   9. INCOME TRACKER
   ========================================================= */

function setupIncomeForm() {
  const form =
    $("income-form") ||
    $("incomeForm");

  if (!form) return;

  const dateInput =
    $("income-date") ||
    $("incomeDate");

  if (dateInput && !dateInput.value) {
    dateInput.value = todayISO();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const description =
      getInputValue("income-description") ||
      getInputValue("incomeDescription");

    const category =
      getInputValue("income-category") ||
      getInputValue("incomeCategory");

    const amount =
      getNumber("income-amount") ||
      getNumber("incomeAmount");

    const date =
      getInputValue("income-date") ||
      getInputValue("incomeDate") ||
      todayISO();

    if (amount <= 0) {
      alert("Please enter a valid income amount.");
      return;
    }

    financeData.income.push({
      id: Date.now(),
      description: description || "Income",
      category: category || "Other",
      amount,
      date
    });

    saveData();

    form.reset();

    if (dateInput) {
      dateInput.value = todayISO();
    }

    renderIncomeTable();
    updateDashboard();
    updateCashFlow();
    updateProfitability();
    drawCashFlowChart();
    drawPerformanceChart();
  });
}


/* =========================================================
   10. EXPENSE TRACKER
   ========================================================= */

function setupExpenseForm() {
  const form =
    $("expense-form") ||
    $("expenseForm");

  if (!form) return;

  const dateInput =
    $("expense-date") ||
    $("expenseDate");

  if (dateInput && !dateInput.value) {
    dateInput.value = todayISO();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const description =
      getInputValue("expense-description") ||
      getInputValue("expenseDescription");

    const category =
      getInputValue("expense-category") ||
      getInputValue("expenseCategory");

    const amount =
      getNumber("expense-amount") ||
      getNumber("expenseAmount");

    const date =
      getInputValue("expense-date") ||
      getInputValue("expenseDate") ||
      todayISO();

    if (amount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    financeData.expenses.push({
      id: Date.now(),
      description: description || "Expense",
      category: category || "Other",
      amount,
      date
    });

    saveData();

    form.reset();

    if (dateInput) {
      dateInput.value = todayISO();
    }

    renderExpenseTable();
    updateDashboard();
    updateCashFlow();
    updateProfitability();
    drawCashFlowChart();
    drawPerformanceChart();
  });
}


/* =========================================================
   11. INCOME TABLE
   ========================================================= */

function renderIncomeTable() {
  const tableBody =
    $("income-table-body") ||
    $("incomeTableBody");

  if (!tableBody) return;

  if (financeData.income.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          No income entries yet.
        </td>
      </tr>
    `;

    updateElement(
      "income-total",
      formatMoney(0)
    );

    return;
  }

  tableBody.innerHTML = financeData.income
    .map((item, index) => {
      return `
        <tr>
          <td>${escapeHTML(item.date)}</td>
          <td>${escapeHTML(item.description)}</td>
          <td>${escapeHTML(item.category)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>
            <button
              type="button"
              class="delete-entry"
              data-income-id="${item.id}"
              aria-label="Delete income entry"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  const total = calculateTotalIncome();

  updateElement(
    "income-total",
    formatMoney(total)
  );

  tableBody
    .querySelectorAll("[data-income-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteIncome(button.dataset.incomeId);
      });
    });
}


function deleteIncome(id) {
  financeData.income =
    financeData.income.filter(
      (item) => String(item.id) !== String(id)
    );

  saveData();

  renderIncomeTable();
  updateDashboard();
  updateCashFlow();
  updateProfitability();
  drawCashFlowChart();
  drawPerformanceChart();
}


/* =========================================================
   12. EXPENSE TABLE
   ========================================================= */

function renderExpenseTable() {
  const tableBody =
    $("expense-table-body") ||
    $("expenseTableBody");

  if (!tableBody) return;

  if (financeData.expenses.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          No expense entries yet.
        </td>
      </tr>
    `;

    updateElement(
      "expense-total",
      formatMoney(0)
    );

    return;
  }

  tableBody.innerHTML = financeData.expenses
    .map((item) => {
      return `
        <tr>
          <td>${escapeHTML(item.date)}</td>
          <td>${escapeHTML(item.description)}</td>
          <td>${escapeHTML(item.category)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>
            <button
              type="button"
              class="delete-entry"
              data-expense-id="${item.id}"
              aria-label="Delete expense entry"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  const total = calculateTotalExpenses();

  updateElement(
    "expense-total",
    formatMoney(total)
  );

  tableBody
    .querySelectorAll("[data-expense-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteExpense(button.dataset.expenseId);
      });
    });
}


function deleteExpense(id) {
  financeData.expenses =
    financeData.expenses.filter(
      (item) => String(item.id) !== String(id)
    );

  saveData();

  renderExpenseTable();
  updateDashboard();
  updateCashFlow();
  updateProfitability();
  drawCashFlowChart();
  drawPerformanceChart();
}


/* =========================================================
   13. CORE CALCULATIONS
   ========================================================= */

function calculateTotalIncome() {
  return financeData.income.reduce(
    (total, item) =>
      total + (Number(item.amount) || 0),
    0
  );
}


function calculateTotalExpenses() {
  return financeData.expenses.reduce(
    (total, item) =>
      total + (Number(item.amount) || 0),
    0
  );
}


function calculateNetCashFlow() {
  return (
    calculateTotalIncome() -
    calculateTotalExpenses()
  );
}


function calculateProfitMargin() {
  const revenue = calculateTotalIncome();
  const expenses = calculateTotalExpenses();

  if (revenue <= 0) {
    return 0;
  }

  return ((revenue - expenses) / revenue) * 100;
}


/* =========================================================
   14. DASHBOARD
   ========================================================= */

function updateDashboard() {
  const totalIncome =
    calculateTotalIncome();

  const totalExpenses =
    calculateTotalExpenses();

  const netCashFlow =
    totalIncome - totalExpenses;

  const profitMargin =
    calculateProfitMargin();

  updateMany(
    [
      "dashboard-income",
      "total-income",
      "totalIncome",
      "kpi-income"
    ],
    formatMoney(totalIncome)
  );

  updateMany(
    [
      "dashboard-expenses",
      "total-expenses",
      "totalExpenses",
      "kpi-expenses"
    ],
    formatMoney(totalExpenses)
  );

  updateMany(
    [
      "dashboard-cash-flow",
      "net-cash-flow",
      "netCashFlow",
      "kpi-cash-flow"
    ],
    formatMoney(netCashFlow)
  );

  updateMany(
    [
      "dashboard-profit-margin",
      "profit-margin",
      "profitMargin",
      "kpi-margin"
    ],
    `${profitMargin.toFixed(1)}%`
  );

  updateMany(
    [
      "dashboard-entries",
      "total-entries"
    ],
    formatNumber(
      financeData.income.length +
      financeData.expenses.length
    )
  );

  updateCashFlowStatus(netCashFlow);
}


function updateCashFlowStatus(value) {
  const elements = document.querySelectorAll(
    ".cash-flow-status, #cash-flow-status"
  );

  elements.forEach((element) => {
    if (value > 0) {
      element.textContent = "Positive cash flow";
      element.dataset.status = "positive";
    } else if (value < 0) {
      element.textContent = "Negative cash flow";
      element.dataset.status = "negative";
    } else {
      element.textContent = "Break-even cash flow";
      element.dataset.status = "neutral";
    }
  });
}


/* =========================================================
   15. CASH FLOW CALCULATOR
   ========================================================= */

function setupCashFlowForm() {
  const form =
    $("cash-flow-form") ||
    $("cashFlowForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    financeData.cashFlow.openingBalance =
      getNumber("opening-balance") ||
      getNumber("openingBalance");

    financeData.cashFlow.projectedInflows =
      getNumber("projected-inflows") ||
      getNumber("projectedInflows");

    financeData.cashFlow.projectedOutflows =
      getNumber("projected-outflows") ||
      getNumber("projectedOutflows");

    saveData();

    updateCashFlow();
    drawCashFlowChart();
  });

  const inputs = form.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      calculateCashFlowLive();
    });
  });
}


function calculateCashFlowLive() {
  const opening =
    getNumber("opening-balance") ||
    getNumber("openingBalance");

  const inflows =
    getNumber("projected-inflows") ||
    getNumber("projectedInflows");

  const outflows =
    getNumber("projected-outflows") ||
    getNumber("projectedOutflows");

  const closing =
    opening + inflows - outflows;

  updateMany(
    [
      "closing-balance",
      "closingBalance",
      "cash-flow-result"
    ],
    formatMoney(closing)
  );
}


function updateCashFlow() {
  const opening =
    Number(financeData.cashFlow.openingBalance) || 0;

  const inflows =
    Number(financeData.cashFlow.projectedInflows) || 0;

  const outflows =
    Number(financeData.cashFlow.projectedOutflows) || 0;

  const calculatedIncome =
    calculateTotalIncome();

  const calculatedExpenses =
    calculateTotalExpenses();

  const actualNet =
    calculatedIncome - calculatedExpenses;

  const projectedClosing =
    opening + inflows - outflows;

  const actualClosing =
    opening + actualNet;

  updateMany(
    [
      "opening-balance-display",
      "openingBalanceDisplay"
    ],
    formatMoney(opening)
  );

  updateMany(
    [
      "projected-inflows-display",
      "projectedInflowsDisplay"
    ],
    formatMoney(inflows)
  );

  updateMany(
    [
      "projected-outflows-display",
      "projectedOutflowsDisplay"
    ],
    formatMoney(outflows)
  );

  updateMany(
    [
      "closing-balance",
      "closingBalance",
      "cash-flow-result"
    ],
    formatMoney(projectedClosing)
  );

  updateMany(
    [
      "actual-closing-balance",
      "actualClosingBalance"
    ],
    formatMoney(actualClosing)
  );

  updateMany(
    [
      "actual-net-cash-flow",
      "actualNetCashFlow"
    ],
    formatMoney(actualNet)
  );
}


/* =========================================================
   16. PROFITABILITY CALCULATOR
   ========================================================= */

function setupProfitabilityForm() {
  const form =
    $("profitability-form") ||
    $("profitabilityForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    financeData.profitability.revenue =
      getNumber("profit-revenue") ||
      getNumber("profitRevenue") ||
      getNumber("revenue");

    financeData.profitability.costOfGoods =
      getNumber("cost-of-goods") ||
      getNumber("costOfGoods") ||
      getNumber("cogs");

    financeData.profitability.operatingExpenses =
      getNumber("operating-expenses") ||
      getNumber("operatingExpenses");

    saveData();

    updateProfitability();
    drawPerformanceChart();
  });

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      calculateProfitabilityLive();
    });
  });
}


function calculateProfitabilityLive() {
  const revenue =
    getNumber("profit-revenue") ||
    getNumber("profitRevenue") ||
    getNumber("revenue");

  const cogs =
    getNumber("cost-of-goods") ||
    getNumber("costOfGoods") ||
    getNumber("cogs");

  const operatingExpenses =
    getNumber("operating-expenses") ||
    getNumber("operatingExpenses");

  const grossProfit =
    revenue - cogs;

  const netProfit =
    grossProfit - operatingExpenses;

  const margin =
    revenue > 0
      ? (netProfit / revenue) * 100
      : 0;

  updateMany(
    [
      "gross-profit",
      "grossProfit"
    ],
    formatMoney(grossProfit)
  );

  updateMany(
    [
      "net-profit",
      "netProfit"
    ],
    formatMoney(netProfit)
  );

  updateMany(
    [
      "profitability-margin",
      "profitabilityMargin"
    ],
    `${margin.toFixed(1)}%`
  );
}


function updateProfitability() {
  const revenue =
    Number(financeData.profitability.revenue) || 0;

  const cogs =
    Number(financeData.profitability.costOfGoods) || 0;

  const operatingExpenses =
    Number(financeData.profitability.operatingExpenses) || 0;

  const grossProfit =
    revenue - cogs;

  const netProfit =
    grossProfit - operatingExpenses;

  const margin =
    revenue > 0
      ? (netProfit / revenue) * 100
      : 0;

  updateMany(
    [
      "profit-revenue-display",
      "profitRevenueDisplay"
    ],
    formatMoney(revenue)
  );

  updateMany(
    [
      "cost-of-goods-display",
      "costOfGoodsDisplay"
    ],
    formatMoney(cogs)
  );

  updateMany(
    [
      "operating-expenses-display",
      "operatingExpensesDisplay"
    ],
    formatMoney(operatingExpenses)
  );

  updateMany(
    [
      "gross-profit",
      "grossProfit"
    ],
    formatMoney(grossProfit)
  );

  updateMany(
    [
      "net-profit",
      "netProfit"
    ],
    formatMoney(netProfit)
  );

  updateMany(
    [
      "profitability-margin",
      "profitabilityMargin"
    ],
    `${margin.toFixed(1)}%`
  );
}


/* =========================================================
   17. FINANCIAL PERFORMANCE CALCULATOR
   ========================================================= */

function calculateFinancialPerformance() {
  const income =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  const net =
    income - expenses;

  const margin =
    income > 0
      ? (net / income) * 100
      : 0;

  return {
    income,
    expenses,
    net,
    margin
  };
}


/* =========================================================
   18. CHART — CASH FLOW
   ========================================================= */

function drawCashFlowChart() {
  const canvas =
    $("cash-flow-chart") ||
    $("cashFlowChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const income =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  const net =
    income - expenses;

  const values = [
    income,
    expenses,
    Math.max(net, 0)
  ];

  const labels = [
    "Income",
    "Expenses",
    "Net Cash Flow"
  ];

  drawBarChart(
    canvas,
    ctx,
    labels,
    values
  );
}


/* =========================================================
   19. CHART — PERFORMANCE
   ========================================================= */

function drawPerformanceChart() {
  const canvas =
    $("performance-chart") ||
    $("performanceChart") ||
    $("financial-chart") ||
    $("financialChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const performance =
    calculateFinancialPerformance();

  const labels = [
    "Income",
    "Expenses",
    "Net"
  ];

  const values = [
    performance.income,
    performance.expenses,
    Math.max(performance.net, 0)
  ];

  drawBarChart(
    canvas,
    ctx,
    labels,
    values
  );
}


/* =========================================================
   20. SIMPLE CANVAS BAR CHART ENGINE
   ========================================================= */

function drawBarChart(
  canvas,
  ctx,
  labels,
  values
) {
  const width =
    canvas.clientWidth || 600;

  const height =
    canvas.clientHeight || 320;

  const ratio =
    window.devicePixelRatio || 1;

  canvas.width =
    width * ratio;

  canvas.height =
    height * ratio;

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const maxValue =
    Math.max(...values, 1);

  const padding = 45;

  const chartWidth =
    width - padding * 2;

  const chartHeight =
    height - padding * 2;

  const barGap = 20;

  const barWidth =
    (chartWidth -
      barGap * (values.length - 1)) /
    values.length;

  values.forEach((value, index) => {
    const safeValue =
      Math.max(Number(value) || 0, 0);

    const barHeight =
      (safeValue / maxValue) *
      chartHeight;

    const x =
      padding +
      index *
        (barWidth + barGap);

    const y =
      height -
      padding -
      barHeight;

    ctx.fillStyle = "#D4AF37";

    ctx.fillRect(
      x,
      y,
      barWidth,
      barHeight
    );

    ctx.fillStyle = "#111111";

    ctx.font =
      "600 12px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
      labels[index],
      x + barWidth / 2,
      height - 20
    );

    ctx.fillText(
      formatMoney(safeValue),
      x + barWidth / 2,
      Math.max(y - 8, 15)
    );
  });

  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(
    padding,
    height - padding
  );

  ctx.lineTo(
    width - padding,
    height - padding
  );

  ctx.stroke();
}


/* =========================================================
   21. RESET SYSTEM
   ========================================================= */

function setupResetButtons() {
  const resetButtons = document.querySelectorAll(
    "#reset-data, #resetData, .reset-data, [data-reset]"
  );

  resetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const confirmed = confirm(
        "Are you sure you want to delete all saved financial data? This cannot be undone."
      );

      if (!confirmed) return;

      financeData =
        structuredClone(DEFAULT_DATA);

      clearSavedData();

      resetAllForms();

      renderIncomeTable();
      renderExpenseTable();
      updateDashboard();
      updateCashFlow();
      updateProfitability();
      drawCashFlowChart();
      drawPerformanceChart();

      showSaveStatus(
        "All financial data has been reset"
      );
    });
  });
}


function resetAllForms() {
  document
    .querySelectorAll("form")
    .forEach((form) => {
      form.reset();
    });

  const dateFields = document.querySelectorAll(
    'input[type="date"]'
  );

  dateFields.forEach((field) => {
    field.value = todayISO();
  });
}


/* =========================================================
   22. RESTORE SAVED FORMS
   ========================================================= */

function restoreForms() {
  setInputValue(
    "opening-balance",
    financeData.cashFlow.openingBalance
  );

  setInputValue(
    "openingBalance",
    financeData.cashFlow.openingBalance
  );

  setInputValue(
    "projected-inflows",
    financeData.cashFlow.projectedInflows
  );

  setInputValue(
    "projectedInflows",
    financeData.cashFlow.projectedInflows
  );

  setInputValue(
    "projected-outflows",
    financeData.cashFlow.projectedOutflows
  );

  setInputValue(
    "projectedOutflows",
    financeData.cashFlow.projectedOutflows
  );

  setInputValue(
    "profit-revenue",
    financeData.profitability.revenue
  );

  setInputValue(
    "profitRevenue",
    financeData.profitability.revenue
  );

  setInputValue(
    "revenue",
    financeData.profitability.revenue
  );

  setInputValue(
    "cost-of-goods",
    financeData.profitability.costOfGoods
  );

  setInputValue(
    "costOfGoods",
    financeData.profitability.costOfGoods
  );

  setInputValue(
    "cogs",
    financeData.profitability.costOfGoods
  );

  setInputValue(
    "operating-expenses",
    financeData.profitability.operatingExpenses
  );

  setInputValue(
    "operatingExpenses",
    financeData.profitability.operatingExpenses
  );

  document
    .querySelectorAll('input[type="date"]')
    .forEach((field) => {
      if (!field.value) {
        field.value = todayISO();
      }
    });
}


/* =========================================================
   23. FAQ
   ========================================================= */

function setupFAQ() {
  const faqButtons =
    document.querySelectorAll(
      ".faq-question"
    );

  faqButtons.forEach((button) => {
    const answer =
      button.nextElementSibling;

    if (!answer) return;

    button.setAttribute(
      "aria-expanded",
      "false"
    );

    answer.style.maxHeight = null;

    button.addEventListener(
      "click",
      () => {
        const isOpen =
          button.getAttribute(
            "aria-expanded"
          ) === "true";

        faqButtons.forEach(
          (otherButton) => {
            if (otherButton === button) {
              return;
            }

            const otherAnswer =
              otherButton.nextElementSibling;

            otherButton.setAttribute(
              "aria-expanded",
              "false"
            );

            if (otherAnswer) {
              otherAnswer.style.maxHeight =
                null;
            }
          }
        );

        if (isOpen) {
          button.setAttribute(
            "aria-expanded",
            "false"
          );

          answer.style.maxHeight = null;
        } else {
          button.setAttribute(
            "aria-expanded",
            "true"
          );

          answer.style.maxHeight =
            answer.scrollHeight + "px";
        }
      }
    );
  });
}


/* =========================================================
   24. CHECKOUT / SELAR
   ========================================================= */

function setupCheckout() {
  const buyButtons =
    document.querySelectorAll(
      "#buy-button, .buy-button, [data-buy]"
    );

  const checkoutNotice =
    $("checkout-notice");

  buyButtons.forEach((button) => {
    if (CHECKOUT_URL) {
      button.setAttribute(
        "href",
        CHECKOUT_URL
      );

      button.removeAttribute(
        "data-checkout-disabled"
      );

      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        if (checkoutNotice) {
          checkoutNotice.hidden = false;

          checkoutNotice.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        } else {
          alert(
            "The Selar checkout link has not been added yet."
          );
        }
      }
    );
  });
}


/* =========================================================
   25. GENERIC DOM UPDATE HELPERS
   ========================================================= */

function updateElement(
  id,
  value
) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}


function updateMany(
  ids,
  value
) {
  ids.forEach((id) => {
    updateElement(
      id,
      value
    );
  });
}


/* =========================================================
   26. WINDOW RESIZE — REDRAW CHARTS
   ========================================================= */

let resizeTimer;

window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      drawCashFlowChart();
      drawPerformanceChart();
    }, 150);
  }
);


/* =========================================================
   27. AUTO-SAVE WHEN PAGE IS LEAVING
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(financeData)
      );
    } catch (error) {
      console.error(
        "Auto-save failed:",
        error
      );
    }
  }
);


/* =========================================================
   28. OPTIONAL EXPORT — JSON
   ========================================================= */

function exportFinancialData() {
  const data =
    JSON.stringify(
      financeData,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      {
        type: "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "nexora-financial-data.json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}


/* =========================================================
   29. OPTIONAL EXPORT — CSV
   ========================================================= */

function exportFinancialCSV() {
  const rows = [
    [
      "Type",
      "Date",
      "Description",
      "Category",
      "Amount"
    ]
  ];

  financeData.income.forEach(
    (item) => {
      rows.push([
        "Income",
        item.date,
        item.description,
        item.category,
        item.amount
      ]);
    }
  );

  financeData.expenses.forEach(
    (item) => {
      rows.push([
        "Expense",
        item.date,
        item.description,
        item.category,
        item.amount
      ]);
    }
  );

  const csv =
    rows
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value ?? "");

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "nexora-financial-data.csv";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}


/* =========================================================
   30. OPTIONAL EXPORT BUTTONS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    document
      .querySelectorAll(
        "#export-json, .export-json"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          exportFinancialData
        );
      });

    document
      .querySelectorAll(
        "#export-csv, .export-csv"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          exportFinancialCSV
        );
      });
  }
);


/* =========================================================
   END OF FINANCE ENGINE
   Nexora Technologies
   Transforming Businesses Through Technology
   ========================================================= */
