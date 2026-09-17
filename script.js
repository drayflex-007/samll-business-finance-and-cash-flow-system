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
  Add the final Selar checkout URL here when published.

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
    openingBalance: 0
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
  setupProfitabilityCalculator();
  setupResetButtons();
  setupFAQ();
  setupCheckout();
  setupExportButtons();

  restoreForms();

  renderIncomeList();
  renderExpenseList();

  updateAllFinancialDisplays();
}


/* =========================================================
   6. STORAGE
   ========================================================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return cloneDefaultData();
    }

    const parsed = JSON.parse(saved);

    return {
      income: Array.isArray(parsed.income)
        ? parsed.income
        : [],

      expenses: Array.isArray(parsed.expenses)
        ? parsed.expenses
        : [],

      cashFlow: {
        openingBalance:
          Number(parsed.cashFlow?.openingBalance) || 0
      },

      profitability: {
        revenue:
          Number(parsed.profitability?.revenue) || 0,

        costOfGoods:
          Number(parsed.profitability?.costOfGoods) || 0,

        operatingExpenses:
          Number(parsed.profitability?.operatingExpenses) || 0
      }
    };
  } catch (error) {
    console.error(
      "Unable to load saved financial data:",
      error
    );

    return cloneDefaultData();
  }
}


function cloneDefaultData() {
  return JSON.parse(
    JSON.stringify(DEFAULT_DATA)
  );
}


function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(financeData)
    );

    showSaveStatus("Financial data saved");
  } catch (error) {
    console.error(
      "Unable to save financial data:",
      error
    );
  }
}


function clearSavedData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "Unable to clear saved data:",
      error
    );
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


function getNumber(id) {
  const element = $(id);

  if (!element) {
    return 0;
  }

  const value = parseFloat(element.value);

  return Number.isFinite(value)
    ? value
    : 0;
}


function getInputValue(id) {
  const element = $(id);

  return element
    ? element.value.trim()
    : "";
}


function setInputValue(id, value) {
  const element = $(id);

  if (element) {
    element.value = value ?? "";
  }
}


function todayISO() {
  return new Date()
    .toISOString()
    .split("T")[0];
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

function updateElement(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

function updateMany(ids, value) {
  ids.forEach((id) => {
    updateElement(id, value);
  });
}

function updateMany(ids, value) {
  ids.forEach((id) => {
    updateElement(id, value);
  });
}

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
      const targetID =
        link.getAttribute("href");

      if (!targetID || targetID === "#") {
        return;
      }

      const target =
        document.querySelector(targetID);

      if (!target) {
        return;
      }

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
  const form = $("income-form");

  if (!form) {
    return;
  }

  const dateInput =
    $("income-date");

  if (
    dateInput &&
    !dateInput.value
  ) {
    dateInput.value = todayISO();
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const description =
        getInputValue(
          "income-description"
        );

      const category =
        getInputValue(
          "income-category"
        );

      const amount =
        getNumber(
          "income-amount"
        );

      const date =
        getInputValue(
          "income-date"
        ) || todayISO();

      if (!description) {
        alert(
          "Please enter an income description."
        );
        return;
      }

      if (!category) {
        alert(
          "Please select an income category."
        );
        return;
      }

      if (amount <= 0) {
        alert(
          "Please enter a valid income amount."
        );
        return;
      }

      financeData.income.push({
        id:
          Date.now() +
          Math.random(),

        description,
        category,
        amount,
        date
      });

      saveData();

      form.reset();

      if (dateInput) {
        dateInput.value =
          todayISO();
      }

      renderIncomeList();
      updateAllFinancialDisplays();
    }
  );
}


/* =========================================================
   10. EXPENSE TRACKER
   ========================================================= */

function setupExpenseForm() {
  const form = $("expense-form");

  if (!form) {
    return;
  }

  const dateInput =
    $("expense-date");

  if (
    dateInput &&
    !dateInput.value
  ) {
    dateInput.value = todayISO();
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const description =
        getInputValue(
          "expense-description"
        );

      const category =
        getInputValue(
          "expense-category"
        );

      const amount =
        getNumber(
          "expense-amount"
        );

      const date =
        getInputValue(
          "expense-date"
        ) || todayISO();

      if (!description) {
        alert(
          "Please enter an expense description."
        );
        return;
      }

      if (!category) {
        alert(
          "Please select an expense category."
        );
        return;
      }

      if (amount <= 0) {
        alert(
          "Please enter a valid expense amount."
        );
        return;
      }

      financeData.expenses.push({
        id:
          Date.now() +
          Math.random(),

        description,
        category,
        amount,
        date
      });

      saveData();

      form.reset();

      if (dateInput) {
        dateInput.value =
          todayISO();
      }

      renderExpenseList();
      updateAllFinancialDisplays();
    }
  );
}


/* =========================================================
   11. INCOME LIST
   ========================================================= */

function renderIncomeList() {
  const list =
    $("income-list");

  if (!list) {
    return;
  }

  const total =
    calculateTotalIncome();

  updateElement(
    "income-total",
    formatMoney(total)
  );

  if (
    financeData.income.length === 0
  ) {
    list.innerHTML = `
      <div class="transaction-empty">
        No income entries yet.
      </div>
    `;

    return;
  }

  const sorted =
    [...financeData.income]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  list.innerHTML =
    sorted
      .map((item) => {
        return `
          <div class="transaction-item">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(
                  item.description
                )}
              </strong>

              <span>
                ${escapeHTML(
                  item.category
                )}
                •
                ${escapeHTML(
                  item.date
                )}
              </span>

            </div>

            <div>

              <span class="transaction-amount">
                +${formatMoney(
                  item.amount
                )}
              </span>

              <button
                type="button"
                class="delete-transaction"
                data-income-id="${item.id}"
                aria-label="Delete income entry"
              >
                Delete
              </button>

            </div>

          </div>
        `;
      })
      .join("");

  list
    .querySelectorAll(
      "[data-income-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          deleteIncome(
            button.dataset.incomeId
          );
        }
      );
    });
}


function deleteIncome(id) {
  financeData.income =
    financeData.income.filter(
      (item) =>
        String(item.id) !==
        String(id)
    );

  saveData();

  renderIncomeList();
  updateAllFinancialDisplays();
}


/* =========================================================
   12. EXPENSE LIST
   ========================================================= */

function renderExpenseList() {
  const list =
    $("expense-list");

  if (!list) {
    return;
  }

  const total =
    calculateTotalExpenses();

  updateElement(
    "expense-total",
    formatMoney(total)
  );

  if (
    financeData.expenses.length === 0
  ) {
    list.innerHTML = `
      <div class="transaction-empty">
        No expense entries yet.
      </div>
    `;

    return;
  }

  const sorted =
    [...financeData.expenses]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  list.innerHTML =
    sorted
      .map((item) => {
        return `
          <div class="transaction-item">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(
                  item.description
                )}
              </strong>

              <span>
                ${escapeHTML(
                  item.category
                )}
                •
                ${escapeHTML(
                  item.date
                )}
              </span>

            </div>

            <div>

              <span class="transaction-amount">
                -${formatMoney(
                  item.amount
                )}
              </span>

              <button
                type="button"
                class="delete-transaction"
                data-expense-id="${item.id}"
                aria-label="Delete expense entry"
              >
                Delete
              </button>

            </div>

          </div>
        `;
      })
      .join("");

  list
    .querySelectorAll(
      "[data-expense-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          deleteExpense(
            button.dataset.expenseId
          );
        }
      );
    });
}


function deleteExpense(id) {
  financeData.expenses =
    financeData.expenses.filter(
      (item) =>
        String(item.id) !==
        String(id)
    );

  saveData();

  renderExpenseList();
  updateAllFinancialDisplays();
}


/* =========================================================
   13. CORE CALCULATIONS
   ========================================================= */

function calculateTotalIncome() {
  return financeData.income.reduce(
    (total, item) =>
      total +
      (Number(item.amount) || 0),
    0
  );
}


function calculateTotalExpenses() {
  return financeData.expenses.reduce(
    (total, item) =>
      total +
      (Number(item.amount) || 0),
    0
  );
}


function calculateNetCashFlow() {
  return (
    calculateTotalIncome() -
    calculateTotalExpenses()
  );
}


function calculateNetProfit() {
  return calculateNetCashFlow();
}


function calculateProfitMargin() {
  const income =
    calculateTotalIncome();

  const profit =
    calculateNetProfit();

  if (income <= 0) {
    return 0;
  }

  return (
    (profit / income) *
    100
  );
}


function calculateExpenseRatio() {
  const income =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  if (income <= 0) {
    return 0;
  }

  return (
    (expenses / income) *
    100
  );
}


/* =========================================================
   14. MASTER DISPLAY UPDATE
   ========================================================= */

function updateAllFinancialDisplays() {
  updateDashboard();
  updateCashFlow();
  updateProfitability();
  updateFinancialPerformance();
  updateDynamicChart();
}


/* =========================================================
   15. DASHBOARD
   ========================================================= */

function updateDashboard() {
  const income =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  const netCashFlow =
    calculateNetCashFlow();

  const netProfit =
    calculateNetProfit();

  const margin =
    calculateProfitMargin();

  const expenseRatio =
    calculateExpenseRatio();


  /* Main KPI cards */

  updateMany(
    [
      "total-income"
    ],
    formatMoney(income)
  );

  updateMany(
    [
      "total-expenses"
    ],
    formatMoney(expenses)
  );

  updateMany(
    [
      "net-cash-flow"
    ],
    formatMoney(netCashFlow)
  );

  updateMany(
    [
      "net-profit"
    ],
    formatMoney(netProfit)
  );

  updateMany(
    [
      "profit-margin"
    ],
    `${margin.toFixed(1)}%`
  );

  updateMany(
    [
      "expense-ratio"
    ],
    `${expenseRatio.toFixed(1)}%`
  );


  /* Hero dashboard preview */

  updateMany(
    [
      "preview-income"
    ],
    formatMoney(income)
  );

  updateMany(
    [
      "preview-expenses"
    ],
    formatMoney(expenses)
  );

  updateMany(
    [
      "preview-cashflow"
    ],
    formatMoney(netCashFlow)
  );

  updateMany(
    [
      "preview-profit"
    ],
    formatMoney(netProfit)
  );
}


/* =========================================================
   16. CASH-FLOW TRACKER
   ========================================================= */

function setupCashFlowForm() {
  const input =
    $("opening-cash");

  if (!input) {
    return;
  }

  input.addEventListener(
    "input",
    () => {
      financeData.cashFlow.openingBalance =
        getNumber(
          "opening-cash"
        );

      updateCashFlow();
      saveData();
    }
  );
}


function updateCashFlow() {
  const opening =
    Number(
      financeData.cashFlow.openingBalance
    ) || 0;

  const net =
    calculateNetCashFlow();

  const closing =
    opening + net;


  updateElement(
    "cash-opening",
    formatMoney(opening)
  );

  updateElement(
    "cash-net",
    formatMoney(net)
  );

  updateElement(
    "cash-closing",
    formatMoney(closing)
  );


  const status =
    $("cash-status");

  if (!status) {
    return;
  }


  if (
    financeData.income.length === 0 &&
    financeData.expenses.length === 0
  ) {
    status.textContent =
      "Add your transactions to see your cash position.";

    status.dataset.status =
      "neutral";

    return;
  }


  if (net > 0) {
    status.textContent =
      "Positive cash flow — more money is coming in than going out.";

    status.dataset.status =
      "positive";

  } else if (net < 0) {
    status.textContent =
      "Negative cash flow — expenses currently exceed income.";

    status.dataset.status =
      "negative";

  } else {
    status.textContent =
      "Break-even cash flow — income and expenses are currently equal.";

    status.dataset.status =
      "neutral";
  }
}


/* =========================================================
   17. PROFITABILITY CALCULATOR
   ========================================================= */

function setupProfitabilityCalculator() {
  const fields = [
    "profit-revenue",
    "profit-direct-cost",
    "profit-operating-cost"
  ];

  fields.forEach((id) => {
    const input = $(id);

    if (!input) {
      return;
    }

    input.addEventListener(
      "input",
      calculateProfitabilityLive
    );

    input.addEventListener(
      "change",
      saveProfitability
    );
  });
}


function calculateProfitabilityValues() {
  const revenue =
    getNumber(
      "profit-revenue"
    );

  const directCost =
    getNumber(
      "profit-direct-cost"
    );

  const operatingCost =
    getNumber(
      "profit-operating-cost"
    );

  const grossProfit =
    revenue - directCost;

  const netProfit =
    grossProfit -
    operatingCost;

  const margin =
    revenue > 0
      ? (netProfit / revenue) * 100
      : 0;

  return {
    revenue,
    directCost,
    operatingCost,
    grossProfit,
    netProfit,
    margin
  };
}


function calculateProfitabilityLive() {
  const values =
    calculateProfitabilityValues();

  updateElement(
    "gross-profit",
    formatMoney(
      values.grossProfit
    )
  );

  updateElement(
    "calculator-net-profit",
    formatMoney(
      values.netProfit
    )
  );

  updateElement(
    "calculator-profit-margin",
    `${values.margin.toFixed(1)}%`
  );
}


function saveProfitability() {
  const values =
    calculateProfitabilityValues();

  financeData.profitability = {
    revenue:
      values.revenue,

    costOfGoods:
      values.directCost,

    operatingExpenses:
      values.operatingCost
  };

  saveData();

  calculateProfitabilityLive();
}


function updateProfitability() {
  const revenue =
    Number(
      financeData.profitability.revenue
    ) || 0;

  const directCost =
    Number(
      financeData.profitability.costOfGoods
    ) || 0;

  const operatingCost =
    Number(
      financeData.profitability.operatingExpenses
    ) || 0;

  const grossProfit =
    revenue - directCost;

  const netProfit =
    grossProfit -
    operatingCost;

  const margin =
    revenue > 0
      ? (netProfit / revenue) * 100
      : 0;

  updateElement(
    "gross-profit",
    formatMoney(grossProfit)
  );

  updateElement(
    "calculator-net-profit",
    formatMoney(netProfit)
  );

  updateElement(
    "calculator-profit-margin",
    `${margin.toFixed(1)}%`
  );
}


/* =========================================================
   18. FINANCIAL PERFORMANCE
   ========================================================= */

function calculateFinancialPerformance() {
  const revenue =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  const profit =
    revenue - expenses;

  const margin =
    revenue > 0
      ? (profit / revenue) * 100
      : 0;

  return {
    revenue,
    expenses,
    profit,
    margin
  };
}


function updateFinancialPerformance() {
  const performance =
    calculateFinancialPerformance();


  updateElement(
    "performance-revenue",
    formatMoney(
      performance.revenue
    )
  );


  updateElement(
    "performance-expenses",
    formatMoney(
      performance.expenses
    )
  );


  updateElement(
    "performance-profit",
    formatMoney(
      performance.profit
    )
  );


  updateElement(
    "performance-margin",
    `${performance.margin.toFixed(1)}%`
  );


  const message =
    $("performance-message");

  if (!message) {
    return;
  }


  if (
    performance.revenue === 0 &&
    performance.expenses === 0
  ) {
    message.textContent =
      "Add financial data to generate your performance summary.";

    message.dataset.status =
      "neutral";

    return;
  }


  if (
    performance.profit > 0
  ) {
    message.textContent =
      "Current performance: income is higher than recorded expenses.";

    message.dataset.status =
      "positive";

  } else if (
    performance.profit < 0
  ) {
    message.textContent =
      "Current performance: recorded expenses are higher than income.";

    message.dataset.status =
      "negative";

  } else {
    message.textContent =
      "Current performance: recorded income and expenses are equal.";

    message.dataset.status =
      "neutral";
  }
}


/* =========================================================
   19. DYNAMIC INCOME VS EXPENSES CHART
   ========================================================= */

function updateDynamicChart() {
  const income =
    calculateTotalIncome();

  const expenses =
    calculateTotalExpenses();

  const maxValue =
    Math.max(
      income,
      expenses,
      1
    );


  const incomeBar =
    $("income-chart-bar");

  const expenseBar =
    $("expense-chart-bar");


  if (incomeBar) {
    const incomeHeight =
      Math.max(
        4,
        (income / maxValue) * 100
      );

    incomeBar.style.height =
      `${incomeHeight}%`;

    incomeBar.setAttribute(
      "aria-label",
      `Income ${formatMoney(income)}`
    );
  }


  if (expenseBar) {
    const expenseHeight =
      Math.max(
        4,
        (expenses / maxValue) * 100
      );

    expenseBar.style.height =
      `${expenseHeight}%`;

    expenseBar.setAttribute(
      "aria-label",
      `Expenses ${formatMoney(expenses)}`
    );
  }


  updateElement(
    "chart-income",
    formatMoney(income)
  );

  updateElement(
    "chart-expenses",
    formatMoney(expenses)
  );
}


/* =========================================================
   20. RESET SYSTEM
   ========================================================= */

function setupResetButtons() {
  const buttons =
    document.querySelectorAll(
      "#reset-data, #resetData, .reset-data, [data-reset]"
    );

  buttons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const confirmed =
          confirm(
            "Are you sure you want to delete all saved financial data? This cannot be undone."
          );

        if (!confirmed) {
          return;
        }

        financeData =
          cloneDefaultData();

        clearSavedData();

        resetAllForms();

        renderIncomeList();
        renderExpenseList();
        updateAllFinancialDisplays();

        showSaveStatus(
          "All financial data has been reset"
        );
      }
    );
  });
}


function resetAllForms() {
  document
    .querySelectorAll("form")
    .forEach((form) => {
      form.reset();
    });

  const dateFields =
    document.querySelectorAll(
      'input[type="date"]'
    );

  dateFields.forEach((field) => {
    field.value =
      todayISO();
  });
}


/* =========================================================
   21. RESTORE SAVED FORMS
   ========================================================= */

function restoreForms() {
  setInputValue(
    "opening-cash",
    financeData.cashFlow.openingBalance
  );

  setInputValue(
    "profit-revenue",
    financeData.profitability.revenue
  );

  setInputValue(
    "profit-direct-cost",
    financeData.profitability.costOfGoods
  );

  setInputValue(
    "profit-operating-cost",
    financeData.profitability.operatingExpenses
  );


  document
    .querySelectorAll(
      'input[type="date"]'
    )
    .forEach((field) => {
      if (!field.value) {
        field.value =
          todayISO();
      }
    });
}


/* =========================================================
   22. FAQ
   ========================================================= */

function setupFAQ() {
  const buttons =
    document.querySelectorAll(
      ".faq-question"
    );

  buttons.forEach((button) => {
    const answer =
      button.nextElementSibling;

    if (!answer) {
      return;
    }

    button.setAttribute(
      "aria-expanded",
      "false"
    );

    answer.style.maxHeight =
      null;

    button.addEventListener(
      "click",
      () => {
        const isOpen =
          button.getAttribute(
            "aria-expanded"
          ) === "true";


        buttons.forEach(
          (otherButton) => {
            if (
              otherButton === button
            ) {
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

          answer.style.maxHeight =
            null;

        } else {
          button.setAttribute(
            "aria-expanded",
            "true"
          );

          answer.style.maxHeight =
            answer.scrollHeight +
            "px";
        }
      }
    );
  });
}


/* =========================================================
   23. CHECKOUT / SELAR
   ========================================================= */

function setupCheckout() {
  const buttons =
    document.querySelectorAll(
      "#buy-button, .buy-button, [data-buy]"
    );

  const notice =
    $("checkout-notice");


  buttons.forEach((button) => {
    if (CHECKOUT_URL) {
      button.setAttribute(
        "href",
        CHECKOUT_URL
      );

      return;
    }


    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        if (notice) {
          notice.hidden =
            false;

          notice.scrollIntoView({
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
   24. EXPORT — JSON
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
        type:
          "application/json"
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
   25. EXPORT — CSV
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
        type:
          "text/csv;charset=utf-8;"
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
   26. EXPORT BUTTONS
   ========================================================= */

function setupExportButtons() {
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


/* =========================================================
   27. AUTO-SAVE
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          financeData
        )
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
   28. OPTIONAL GLOBAL EXPORT ACCESS
   ========================================================= */

window.exportFinancialData =
  exportFinancialData;

window.exportFinancialCSV =
  exportFinancialCSV;


/* =========================================================
   END OF FINANCE ENGINE
   Nexora Technologies
   Transforming Businesses Through Technology
   ========================================================= */
