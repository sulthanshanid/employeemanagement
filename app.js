const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // Replace with your actual password
  database: "rami", // Replace with your actual database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (like CSS) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// EJS templating engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Dashboard route to fetch employees and workplaces and render the page
app.get("/dashboard", (req, res) => {
  const getEmployeesQuery = "SELECT * FROM employees";
  const getWorkplacesQuery = "SELECT * FROM workplaces";

  db.query(getEmployeesQuery, (err, employees) => {
    if (err) {
      return res.status(500).send(err);
    }
    db.query(getWorkplacesQuery, (err, workplaces) => {
      if (err) {
        return res.status(500).send("Error fetching workplaces.");
      }
      res.render("dashboard", { employees, workplaces });
    });
  });
});

// Route to update an employee
app.post("/update-employee/:id", (req, res) => {
  const employeeId = req.params.id;
  const { name, designation, basic_wage, workplace, dailyWage } = req.body;

  // Make sure to use the correct column name for employee ID
  const updateEmployeeQuery =
    "UPDATE employees SET name = ?, designation = ? ,basic_wage=? WHERE employee_id = ?";

  db.query(
    updateEmployeeQuery,
    [name, designation, basic_wage, employeeId],
    (err) => {
      if (err) {
        return res.status(500).send("Error updating employee.");
      }
      res.redirect("/dashboard");
    }
  );
});

// Route to add a new employee
app.post("/add-employee", (req, res) => {
  const { name, designation, basic_wage } = req.body;
  const addEmployeeQuery =
    "INSERT INTO employees (name, designation,basic_wage ) VALUES (?, ?,?)";

  db.query(addEmployeeQuery, [name, designation, basic_wage], (err) => {
    if (err) {
      return res.status(500).send("Error adding employee.");
    }
    res.redirect("/dashboard");
  });
});

// Route to get employee data by ID
app.get("/get-employee/:id", (req, res) => {
  const employeeId = req.params.id;

  // Query for specific employee
  db.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    [employeeId],
    (err, result) => {
      if (err) {
        console.error("Error fetching employee:", err);
        return res.status(500).send("Database error");
      }

      // If the employee is found, return the data
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send("Employee not found");
      }
    }
  );
});
app.get("/workplaces", (req, res) => {
  const getWorkplacesQuery = "SELECT * FROM workplaces";
  db.query(getWorkplacesQuery, (err, workplaces) => {
    if (err) {
      return res.status(500).send("Error fetching workplaces.");
    }
    res.render("workplaces", { workplaces });
  });
});

// Route to add a new workplace
app.post("/add-workplace", (req, res) => {
  console.log("Request Body:", req.body); // Debug log the body
  const { workplaceName } = req.body;
  const addWorkplaceQuery =
    "INSERT INTO workplaces (workplace_name) VALUES (?)";

  db.query(addWorkplaceQuery, [workplaceName], (err) => {
    if (err) {
      console.error("Error adding workplace:", err.message);
      return res.status(500).send("Error adding workplace.");
    }
    res.redirect("/workplaces");
  });
});

app.post("/update-workplace/:id", (req, res) => {
  const workplaceId = req.params.id;
  const { workplaceName } = req.body;
  const updateWorkplaceQuery =
    "UPDATE workplaces SET workplace_name = ? WHERE workplace_id = ?";

  db.query(updateWorkplaceQuery, [workplaceName, workplaceId], (err) => {
    if (err) {
      // Log detailed error for debugging
      console.error("Error updating workplace:", err.message);
      console.error("SQL Query:", updateWorkplaceQuery);
      console.error("Query Parameters:", [workplaceName, workplaceId]);

      return res.status(500).send("Error updating workplace.");
    }
    res.redirect("/workplaces");
  });
});

// Route to get a specific workplace (for editing)
app.get("/get-workplace/:id", (req, res) => {
  const workplaceId = req.params.id;

  db.query(
    "SELECT * FROM workplaces WHERE workplace_id = ?",
    [workplaceId],
    (err, result) => {
      if (err) {
        console.error("Error fetching workplace:", err);
        return res.status(500).send("Database error");
      }

      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send("Workplace not found");
      }
    }
  );
});

app.get("/attendance", (req, res) => {
  const { date } = req.query; // Get the date from the query

  // Query to fetch all employees with their workplace and attendance status for the selected date
  const getEmployeesQuery = `
      SELECT e.employee_id, e.name, a.status, a.wage 
      FROM employees e
      LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.date = ?
    `;

  // Query to fetch all workplaces
  const getWorkplacesQuery = "SELECT * FROM workplaces";

  // Fetch the employees and workplaces
  db.query(getEmployeesQuery, [date], (err, employees) => {
    if (err) {
      return res.status(500).send("Error fetching employees.");
    }

    db.query(getWorkplacesQuery, (err, workplaces) => {
      if (err) {
        return res.status(500).send("Error fetching workplaces.");
      }

      // Render the template, passing both employees and workplaces
      res.render("attendanceForm", {
        employees,
        workplaces,
        selectedDate: date,
      });
    });
  });
});

// Post Route: Display employees and attendance data for a specific date
app.post("/updateWages", (req, res) => {
  const { date } = req.body; // Get selected date from form submission

  // Fetch employees and workplaces for the selected date
  const getEmployeesQuery = `
        SELECT e.employee_id, e.name, a.status, a.wage,a.workplace_id
        FROM employees e
        LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.date = ?
    `;
  const getWorkplacesQuery = "SELECT * FROM workplaces";

  // Fetch employee data
  db.query(getEmployeesQuery, [date], (err, employees) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching employees." });
    }

    // Fetch workplace data
    db.query(getWorkplacesQuery, (err, workplaces) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching workplaces." });
      }

      // Return employee data and workplaces in JSON format for AJAX
      res.json({
        employees,
        workplaces,
        selectedDate: date,
      });
    });
  });
});

// Post Route: Save the attendance and wage data
app.post("/saveWages", (req, res) => {
  const selectedDate = req.body.date;
  let processedCount = 0; // Counter to track completed database operations
  const totalEmployees = Object.keys(req.body).filter((key) =>
    key.startsWith("wage_")
  ).length; // Total number of employees

  const updateQueries = [];

  // Loop through each employee and update their wage and status
  for (let employeeId in req.body) {
    if (employeeId.startsWith("wage_")) {
      const wage = req.body[employeeId];
      const empId = employeeId.split("_")[1]; // Extract employee ID from field name
      const status = req.body[`status_${empId}`]; // Get attendance status
      let workplace_id = req.body[`workplace_${empId}`];

      // If workplace_id is empty, set it to NULL
      if (workplace_id === "") {
        workplace_id = null;
      }

      // Prepare the query
      const query = `
        INSERT INTO attendance (employee_id, date, status, wage, workplace_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE wage = ?, status = ?, workplace_id = ?
      `;

      // Prepare query parameters
      const queryParams = [
        empId,
        selectedDate,
        status,
        wage,
        workplace_id,
        wage,
        status,
        workplace_id,
      ];

      // Add the query and parameters to the list
      updateQueries.push(
        new Promise((resolve, reject) => {
          db.query(query, queryParams, (err, result) => {
            if (err) {
              console.error("MySQL Error: ", err); // Log the MySQL error
              reject("Database error");
            } else {
              console.log("MySQL Response: ", result);
              resolve(); // Resolve the promise when query is successful
            }
          });
        })
      );
    }
  }

  // After all queries are added, wait for all of them to finish
  Promise.all(updateQueries)
    .then(() => {
      res.redirect("/attendance"); // Redirect only once after all queries are completed
    })
    .catch((err) => {
      res.status(500).send(err); // Send an error response if any query failed
    });
});

app.get("/loan", (req, res) => {
  // Fetch employees for the dropdown list and loans to display in the table
  db.query("SELECT employee_id, name FROM employees", (err, employees) => {
    if (err) {
      return res.status(500).send("Error fetching employees.");
    }

    // Fetch all loans from the database
    db.query(
      "SELECT loans.loan_id, employees.name, loans.loan_amount, loans.loan_date FROM loans INNER JOIN employees ON loans.employee_id = employees.employee_id",
      (err, loans) => {
        if (err) {
          return res.status(500).send("Error fetching loans.");
        }
        // Render loan page with employee list and loans
        res.render("loanForm", { employees, loans });
      }
    );
  });
});

app.post("/loan", (req, res) => {
  const { employee_id, loan_amount, loan_date } = req.body;

  // Insert the loan data into the loans table
  const query =
    "INSERT INTO loans (employee_id, loan_amount, loan_date) VALUES (?, ?, ?)";

  db.query(query, [employee_id, loan_amount, loan_date], (err, result) => {
    if (err) {
      return res.status(500).send("Error saving loan.");
    }
    // Redirect back to the loan page to show the updated loans
    res.redirect("/loan");
  });
});

app.get("/generate-salary", (req, res) => {
  db.query("SELECT employee_id, name FROM employees", (err, employees) => {
    if (err) {
      return res.status(500).send("Error fetching employees.");
    }
    res.render("salaryForm", { employees });
  });
});

// Route to handle salary calculation
app.post("/generate-salary", (req, res) => {
  const { employee_id, month, year } = req.body;

  // Query for employee's name and daily wage
  const employeeQuery = `
    SELECT name, basic_wage
    FROM employees
    WHERE employee_id = ?`;

  // Query for detailed attendance, including workplace ID
  const attendanceQuery = `
    SELECT a.date, a.wage, a.status, a.workplace_id
    FROM attendance a
    WHERE a.employee_id = ? AND MONTH(a.date) = ? AND YEAR(a.date) = ?`;

  // Query for total salary calculation
  const salaryQuery = `
    SELECT SUM(a.wage) AS total_salary
    FROM attendance a
    WHERE a.employee_id = ? AND a.status = 'Present'
    AND MONTH(a.date) = ? AND YEAR(a.date) = ?`;

  // Query for counting absent days
  const absentDaysQuery = `
    SELECT COUNT(*) AS absent_days
    FROM attendance a
    WHERE a.employee_id = ? AND a.status = 'Absent'
    AND MONTH(a.date) = ? AND YEAR(a.date) = ?`;

  // Query for loan details
  const loanQuery = `
    SELECT loan_amount, loan_date
    FROM loans
    WHERE employee_id = ? AND MONTH(loan_date) = ? AND YEAR(loan_date) = ?`;

  // Query for deduction details
  const deductionQuery = `
    SELECT amount, date, remark
    FROM deduction
    WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`;

  // Query for overtime days
  const overtimeDaysQuery = `
    SELECT COUNT(*) AS overtime_days
    FROM attendance a
    WHERE a.employee_id = ? AND a.wage > (SELECT basic_wage FROM employees WHERE employee_id = ?)
    AND MONTH(a.date) = ? AND YEAR(a.date) = ?`;

  // Query for workplace names
  const workplaceQuery = `
    SELECT workplace_name
    FROM workplaces
    WHERE workplace_id = ?`;

  // Get employee name and basic wage
  db.query(employeeQuery, [employee_id], (err, result) => {
    if (err) return res.status(500).send("Error fetching employee details.");
    if (result.length === 0) return res.status(404).send("Employee not found.");

    const { name, basic_wage } = result[0];
    const dailyWage = basic_wage;

    // Get attendance details, including workplace ID
    db.query(attendanceQuery, [employee_id, month, year], (err, attendance) => {
      if (err) return res.status(500).send("Error fetching attendance.");

      // Add an overtime field for each attendance record
      const detailedAttendance = attendance.map((record) => {
        const overtime = record.wage > dailyWage ? record.wage - dailyWage : 0;
        return {
          ...record,
          overtime,
        };
      });

      // Get absent days count
      db.query(
        absentDaysQuery,
        [employee_id, month, year],
        (err, absentResult) => {
          if (err) return res.status(500).send("Error counting absent days.");

          const absentDays = absentResult[0].absent_days || 0;

          // Calculate total salary
          db.query(
            salaryQuery,
            [employee_id, month, year],
            (err, salaryResults) => {
              if (err) return res.status(500).send("Error calculating salary.");

              const totalSalary = salaryResults[0].total_salary || 0;

              // Get loan details
              db.query(loanQuery, [employee_id, month, year], (err, loans) => {
                if (err)
                  return res.status(500).send("Error fetching loan details.");

                // Get deduction details
                db.query(
                  deductionQuery,
                  [employee_id, month, year],
                  (err, deductions) => {
                    if (err)
                      return res.status(500).send("Error fetching deductions.");

                    // Get overtime days
                    db.query(
                      overtimeDaysQuery,
                      [employee_id, employee_id, month, year],
                      (err, overtimeResult) => {
                        if (err)
                          return res
                            .status(500)
                            .send("Error calculating overtime days.");

                        const totalLoans = loans.reduce(
                          (sum, loan) => sum + loan.loan_amount,
                          0
                        );
                        const totalDeductions = deductions.reduce(
                          (sum, deduction) => sum + deduction.amount,
                          0
                        );
                        const netSalary =
                          totalSalary - totalLoans - totalDeductions;
                        const overtimeDays = overtimeResult[0].overtime_days;

                        // Create a table to show workplace attendance count
                        const workplaceAttendance = {};
                        attendance.forEach((record) => {
                          const workplaceId = record.workplace_id;
                          if (!workplaceAttendance[workplaceId]) {
                            workplaceAttendance[workplaceId] = 0;
                          }
                          workplaceAttendance[workplaceId]++;
                        });

                        // Fetch workplace names based on workplace IDs
                        const workplaceNames = [];
                        const workplacePromises = Object.keys(
                          workplaceAttendance
                        ).map((workplaceId) => {
                          return new Promise((resolve, reject) => {
                            db.query(
                              workplaceQuery,
                              [workplaceId],
                              (err, workplaceResult) => {
                                if (err) return reject(err);
                                workplaceNames.push({
                                  workplaceId,
                                  name: workplaceResult[0]?.workplace_name || "Unknown",
                                });
                                resolve();
                              }
                            );
                          });
                        });

                        // Wait for all workplace names to be fetched
                        Promise.all(workplacePromises)
                          .then(() => {
                            // Render the salary card with all data, including employee name and workplace attendance
                            res.render("salaryCard", {
                              employee_id,
                              name,
                              month,
                              year,
                              detailedAttendance,
                              totalSalary,
                              loans,
                              totalLoans,
                              deductions,
                              totalDeductions,
                              netSalary,
                              overtimeDays,
                              absentDays,
                              basic_wage,
                              workplaceAttendance,
                              workplaceNames,
                            });
                          })
                          .catch((err) => {
                            return res
                              .status(500)
                              .send(err);
                          });
                      }
                    );
                  }
                );
              });
            }
          );
        }
      );
    });
  });
});

app.post("/generate-summary", (req, res) => {
  const { month, year, workplace } = req.body;

  // Query to get all workplaces
  const workplacesQuery = `SELECT workplace_id, workplace_name FROM workplaces`;
  let employeesQuery = "";

  if (workplace === "") {
    // Query to get all employees and their basic wages, no workplace filter
    employeesQuery = `
      SELECT employees.employee_id, employees.name, employees.basic_wage
      FROM employees
    `;
  } else {
    // Query to get all employees with their basic wages, filtered by workplace_id
    employeesQuery = `
       SELECT employees.employee_id, employees.name, basic_wage
    FROM employees,attendance
    WHERE employees.employee_id=attendance.employee_id and attendance.workplace_id = ? 
    `;
  }

  // Fetch workplaces
  db.query(workplacesQuery, (err, workplaces) => {
    if (err) return res.status(500).send(err);

    // Add an 'All Workplaces' option (value is null, representing no filter)
    workplaces.unshift({ id: null, name: "All Workplaces" });

    // Now query the employees, filtered by the selected workplace_id
    db.query(employeesQuery, [workplace, workplace], (err, employees) => {
      if (err) return res.status(500).send(err);

      if (employees.length === 0)
        return res.status(404).send("No employees found.");

      const summary = [];
      let processed = 0;

      employees.forEach((employee) => {
        const { employee_id, name, basic_wage } = employee;

        // Salary calculation query
        db.query(
          `SELECT SUM(wage) AS total_salary
          FROM attendance
          WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'Present'`,
          [employee_id, month, year],
          (err, salaryResults) => {
            if (err) return res.status(500).send("Error calculating salaries.");

            const totalSalary = salaryResults[0]?.total_salary || 0;

            //l Loan calculation query
            db.query(
              `SELECT SUM(loan_amount) AS total_loans
              FROM loans
              WHERE employee_id = ? AND MONTH(loan_date) = ? AND YEAR(loan_date) = ?`,
              [employee_id, month, year],
              (err, loanResults) => {
                if (err)
                  return res.status(500).send("Error calculating loans.");

                const totalLoans = loanResults[0]?.total_loans || 0;

                // Deduction calculation query
                db.query(
                  `SELECT SUM(amount) AS total_deductions
                  FROM deduction
                  WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
                  [employee_id, month, year],
                  (err, deductionResults) => {
                    if (err)
                      return res
                        .status(500)
                        .send("Error calculating deductions.");

                    const totalDeductions =
                      deductionResults[0]?.total_deductions || 0;
                    const finalSalary =
                      totalSalary - totalLoans - totalDeductions;

                    // Attendance details query
                    db.query(
                      `SELECT date, status, wage
                      FROM attendance
                      WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
                      [employee_id, month, year],
                      (err, attendanceResults) => {
                        if (err)
                          return res
                            .status(500)
                            .send("Error fetching attendance.");

                        let overtimeDays = 0;
                        const detailedAttendance = attendanceResults.map(
                          (record) => {
                            const overtime =
                              record.wage > basic_wage
                                ? record.wage - basic_wage
                                : 0;
                            if (overtime > 0) overtimeDays++;
                            return { ...record, overtime };
                          }
                        );

                        summary.push({
                          employee_id,
                          name,
                          totalSalary,
                          totalLoans,
                          totalDeductions,
                          finalSalary,
                          overtimeDays,
                          detailedAttendance,
                        });

                        processed++;

                        if (processed === employees.length) {
                          res.render("salarySummary", {
                            month,
                            year,
                            summary,
                            workplaces, // Pass workplaces to EJS
                          });
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

app.get("/generate-summary", (req, res) => {
  const workplacesQuery = `SELECT workplace_id, workplace_name FROM workplaces`;

  // Fetch workplaces
  db.query(workplacesQuery, (err, workplaces) => {
    if (err) return console.log("Error fetching workplaces.", err);

    // Add an 'All Workplaces' option (value is null, representing no filter)
    workplaces.unshift({
      workplace_id: null,
      workplace_name: "All Workplaces",
    });

    res.render("generateSummary", { workplaces }); // Render with workplaces only
  });
});

// Home page route
app.get("/ramin", (req, res) => {
  res.render("index"); // Renders the index.ejs file
});
// GET Route: Display deduction form
app.get("/deduction", (req, res) => {
  const getEmployeesQuery = "SELECT employee_id, name FROM employees";

  db.query(getEmployeesQuery, (err, employees) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).send("Database error");
    }
    res.render("deductionForm", {
      employees,
      deductions: [],
      selectedEmployeeId: null,
    });
  });
});

app.post("/deduction", (req, res) => {
  const { employee_id, date, amount, remarks } = req.body;

  if (!employee_id) {
    return res.status(400).send("Employee must be selected.");
  }

  // Insert deduction into the database
  const deductionQuery = `
      INSERT INTO Deduction (employee_id, date, amount, remark)
      VALUES (?, ?, ?, ?)
    `;

  db.query(deductionQuery, [employee_id, date, amount, remarks], (err) => {
    if (err) {
      console.error("Error inserting deduction:", err);
      return res.status(500).send("Error inserting deduction");
    }

    // After insertion, get the updated deductions for the selected employee
    const getDeductionsQuery = `
        SELECT * FROM Deduction WHERE employee_id = ? ORDER BY date DESC
      `;

    db.query(getDeductionsQuery, [employee_id], (err, deductions) => {
      if (err) {
        console.error("Error fetching deductions:", err);
        return res.status(500).send("Error fetching deductions");
      }

      // Re-render the page with the updated deductions
      const getEmployeesQuery = "SELECT employee_id, name FROM employees";
      db.query(getEmployeesQuery, (err, employees) => {
        if (err) {
          console.error("Error fetching employees:", err);
          return res.status(500).send("Error fetching employees");
        }

        res.render("deductionForm", {
          employees,
          deductions,
          selectedEmployeeId: employee_id,
        });
      });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
