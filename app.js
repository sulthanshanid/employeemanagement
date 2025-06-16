const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const moment = require("moment");
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
// Route to fetch employees
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

// Route to update employee including the status field
app.post("/update-employee/:id", (req, res) => {
  const employeeId = req.params.id;
  const { name, designation, basic_wage, status } = req.body;

  const updateEmployeeQuery =
    "UPDATE employees SET name = ?, designation = ?, basic_wage = ?, status = ? WHERE employee_id = ?";

  db.query(
    updateEmployeeQuery,
    [name, designation, basic_wage, status, employeeId],
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
  const { name, designation, basic_wage, status } = req.body;
  const addEmployeeQuery =
    "INSERT INTO employees (name, designation, basic_wage, status) VALUES (?, ?, ?, ?)";

  db.query(addEmployeeQuery, [name, designation, basic_wage, status], (err) => {
    if (err) {
      return res.status(500).send("Error adding employee.");
    }
    res.redirect("/dashboard");
  });
});

// Route to get employee data by ID
app.get("/get-employee/:id", (req, res) => {
  const employeeId = req.params.id;

  db.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    [employeeId],
    (err, result) => {
      if (err) {
        console.error("Error fetching employee:", err);
        return res.status(500).send("Database error");
      }

      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send("Employee not found");
      }
    }
  );
});

// Route to delete an employee
app.delete("/delete-employee/:id", (req, res) => {
  const employeeId = req.params.id;

  const deleteEmployeeQuery = "DELETE FROM employees WHERE employee_id = ?";

  db.query(deleteEmployeeQuery, [employeeId], (err) => {
    if (err) {
      return res.status(500).send("Error deleting employee.");
    }
    res.status(200).send("Employee deleted successfully.");
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
app.get("/workplaces", (req, res) => {
  const getWorkplacesQuery = "SELECT * FROM workplaces";
  db.query(getWorkplacesQuery, (err, workplaces) => {
    if (err) {
      return res.status(500).send("Error fetching workplaces.");
    }
    res.render("workplaces", { workplaces });
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
app.post("/delete-workplace/:id", (req, res) => {
  const workplaceId = req.params.id;

  const deleteWorkplaceQuery = "DELETE FROM workplaces WHERE workplace_id = ?";

  db.query(deleteWorkplaceQuery, [workplaceId], (err) => {
    if (err) {
      console.error("Error deleting workplace:", err.message);
      return res.status(500).send("Error deleting workplace.");
    }
    res.redirect("/workplaces");
  });
});

// Backend Update:
app.get("/attendance", (req, res) => {
  const { date } = req.query; // Get the date from the query

  // Query to fetch all employees with their workplace and attendance status for the selected date
  const getEmployeesQuery = `
      SELECT e.employee_id, e.name, a.status, a.wage, a.workplace_id
FROM employees e
LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.date = ?
WHERE e.status = "Working"

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

      // Send JSON response with employees and workplaces
      res.json({ employees, workplaces, selectedDate: date });
    });
  });
});
app.get("/attendances", (req, res) => {
  res.render("test");
});
app.post("/saveWages", (req, res) => {
  const { date, data } = req.body;

  // Prepare valid pairs (employeeId, workplaceId) from received data
  const validPairs = data.map((item) => [
    item.employeeId,
    item.workplaceId || -1,
  ]);

  // Generate the delete query to remove rows that are not in validPairs
  let deleteQuery = `
    DELETE FROM attendance 
    WHERE date = ? 
    AND (employee_id, workplace_id) NOT IN (?);
  `;

  // Prepare the query parameters for the delete operation
  const deleteQueryParams = validPairs
    .map((pair) => `(${pair[0]}, ${pair[1]})`)
    .join(", ");

  // Only perform the deletion if there are valid pairs to check against
  if (validPairs.length === 0) {
    return res.status(400).send("No valid attendance data provided.");
  }

  const deletePromise = new Promise((resolve, reject) => {
    // Execute the delete query with the correctly formatted parameters
    const query = `DELETE FROM attendance WHERE date = ? AND (employee_id, workplace_id) NOT IN (${deleteQueryParams})`;
    db.query(query, [date], (err) => {
      if (err) {
        console.error("MySQL Delete Error: ", err);
        return reject("Delete error");
      }
      resolve();
    });
  });

  const updateQueries = data.map((item) => {
    const { employeeId, wage, status, workplaceId } = item;

    return new Promise((resolve, reject) => {
      // Check if the record already exists
      const checkQuery = `
        SELECT * FROM attendance 
        WHERE employee_id = ? AND date = ? AND workplace_id = ?;
      `;
      const checkParams = [employeeId, date, workplaceId || -1];

      db.query(checkQuery, checkParams, (err, results) => {
        if (err) {
          console.error("MySQL Error: ", err);
          return reject("Database error");
        }

        if (results.length > 0) {
          // Update existing record
          const updateQuery = `
            UPDATE attendance 
            SET wage = ?, status = ? 
            WHERE employee_id = ? AND date = ? AND workplace_id = ?;
          `;
          const updateParams = [
            wage,
            status,
            employeeId,
            date,
            workplaceId || -1,
          ];

          db.query(updateQuery, updateParams, (err) => {
            if (err) {
              console.error("MySQL Update Error: ", err);
              return reject("Update error");
            }
            resolve();
          });
        } else {
          // Insert new record
          const insertQuery = `
            INSERT INTO attendance (employee_id, date, status, wage, workplace_id) 
            VALUES (?, ?, ?, ?, ?);
          `;
          const insertParams = [
            employeeId,
            date,
            status,
            wage,
            workplaceId || -1,
          ];

          db.query(insertQuery, insertParams, (err) => {
            if (err) {
              console.error("MySQL Insert Error: ", err);
              return reject("Insert error");
            }
            resolve();
          });
        }
      });
    });
  });

  // Wait for both update and delete operations
  Promise.all([...updateQueries, deletePromise])
    .then(() => {
      res.status(200).send("Attendance saved successfully.");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/loan", (req, res) => {
  const selectedMonth = req.query.month;
  const selectedYear = req.query.year;

  db.query("SELECT employee_id, name FROM employees", (err, employees) => {
    if (err) return res.status(500).send("Error fetching employees.");

    let query = `
      SELECT loans.loan_id, employees.name, loans.loan_amount, loans.loan_date 
      FROM loans 
      INNER JOIN employees ON loans.employee_id = employees.employee_id
    `;

    const params = [];

    if (selectedMonth && selectedYear) {
      query += " WHERE MONTH(loan_date) = ? AND YEAR(loan_date) = ?";
      params.push(selectedMonth, selectedYear);
    }

    db.query(query, params, (err, loans) => {
      if (err) return res.status(500).send("Error fetching loans.");
      res.render("loanForm", { loans, employees, selectedMonth, selectedYear });
    });
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
app.post("/loan/delete/:loan_id", (req, res) => {
  const { loan_id } = req.params;

  db.query("DELETE FROM loans WHERE loan_id = ?", [loan_id], (err, result) => {
    if (err) {
      return res.status(500).send("Error deleting loan.");
    }
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
    SELECT e.basic_wage, a.date, a.wage, a.status, a.workplace_id, w.workplace_name
FROM attendance a
JOIN employees e ON e.employee_id = a.employee_id
LEFT JOIN workplaces w ON w.workplace_id = a.workplace_id
WHERE a.employee_id = ? 
  AND MONTH(a.date) = ? 
  AND YEAR(a.date) = ?
`;

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
        const overtime =
          Number(record.wage) > dailyWage ? Number(record.wage) - dailyWage : 0;
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
                          (sum, loan) => Number(sum) + Number(loan.loan_amount),
                          0
                        );
                        const totalDeductions = deductions.reduce(
                          (sum, deduction) =>
                            Number(sum) + Number(deduction.amount),
                          0
                        );
                        const netSalary =
                          Number(totalSalary) -
                          Number(totalLoans) -
                          Number(totalDeductions);
                        const overtimeDays = overtimeResult[0].overtime_days;

                        // Create a table to show workplace attendance count
                        const workplaceAttendance = {};
                        attendance.forEach((record) => {
                          if (record.status != "Absent") {
                            const workplaceId = record.workplace_id;

                            if (!workplaceAttendance[workplaceId]) {
                              workplaceAttendance[workplaceId] = 0;
                            }
                            workplaceAttendance[workplaceId]++;
                          }
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
                                  name:
                                    workplaceResult[0]?.workplace_name ||
                                    "Unknown",
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
                            console.log(totalLoans);
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

                              workplaceAttendance,
                              workplaceNames,
                            });
                          })
                          .catch((err) => {
                            return res.status(500).send(err);
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
      SELECT DISTINCT(employees.employee_id), employees.name, employees.basic_wage
      FROM employees where employees.status="Working"
    `;
  } else {
    // Query to get all employees with their basic wages, filtered by workplace_id
    employeesQuery = `
      SELECT DISTINCT(employees.employee_id), employees.name, employees.basic_wage
      FROM employees
      JOIN attendance ON employees.employee_id = attendance.employee_id
      WHERE attendance.workplace_id = ?  AND MONTH(attendance.date)= ? AND YEAR(attendance.date)= ? and employees.status="Working"
    `;
  }

  // Fetch workplaces
  db.query(workplacesQuery, (err, workplaces) => {
    if (err) return res.status(500).send(err);

    // Add an 'All Workplaces' option (value is null, representing no filter)
    workplaces.unshift({ id: null, name: "All Workplaces" });
    const selectedWorkplaceName = workplace
      ? workplaces.find((w) => w.workplace_id == workplace)?.workplace_name
      : "All Workplaces";

    // Now query the employees, filtered by the selected workplace_id
    db.query(employeesQuery, [workplace, month, year], (err, employees) => {
      if (err) return res.status(500).send(err);

      if (employees.length === 0)
        return res.status(404).send("No employees found.");

      const summary = [];
      let processed = 0;

      employees.forEach((employee) => {
        const { employee_id, name, basic_wage } = employee;

        // Salary calculation query
        const salaryQuery = `
          SELECT SUM(wage) AS total_salary
          FROM attendance
          WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
          ${workplace ? "AND workplace_id = ?" : ""}
        `;
        const salaryParams = workplace
          ? [employee_id, month, year, workplace]
          : [employee_id, month, year];

        db.query(salaryQuery, salaryParams, (err, salaryResults) => {
          if (err) return res.status(500).send("Error calculating salaries.");

          const totalSalary = salaryResults[0]?.total_salary || 0;

          if (workplace) {
            // When a specific workplace is chosen, set loans and deductions to 0
            summary.push({
              employee_id,
              name,
              totalSalary,
              totalLoans: 0,
              totalDeductions: 0,
              finalSalary: totalSalary,
              overtimeDays: 0, // To be calculated in attendance query
              detailedAttendance: [], // To be filled later
            });

            processed++;
            if (processed === employees.length) {
              console.log("history", workplaces);
              res.render("salarySummary", {
                month,
                year,
                summary,
                workplaces,
                selectedWorkplaceName, // Pass workplaces to EJS
              });
            }
          } else {
            let selectedWorkplaceName = "";
            // Loan calculation query
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
                      WHERE  employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
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
                            workplaces,
                            selectedWorkplaceName,
                            // Pass workplaces to EJS
                          });
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        });
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
app.get("/stats", (req, res) => {
  const getWorkplacesQuery = "SELECT * FROM workplaces";

  db.query(getWorkplacesQuery, (err, workplaces) => {
    if (err) {
      return res.status(500).send("Error fetching workplaces.");
    }
    res.render("stats", { workplaces });
  });
});
app.get("/stats/today", (req, res) => {
  const workplaceId = req.query.workplace;
  const today = new Date().toISOString().split("T")[0];

  // Check if attendance was recorded today
  const checkAttendanceQuery = `
    SELECT COUNT(*) AS count 
    FROM attendance 
    WHERE date = ? 
  `;

  db.query(checkAttendanceQuery, [today], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const attendanceCount = result[0].count;

    if (attendanceCount === 0) {
      // No attendance taken today for this workplace
      return res.json({
        present: 0,
        absent: 0,
        total: 0,
        presentEmployees: [],
        absentEmployees: [],
        message: "Attendance not recorded for today.",
      });
    }

    // Continue if attendance taken
    const totalQuery = ` 
  SELECT 
    e.employee_id, 
    e.name, 
    e.basic_wage AS base_wage,
    a.wage AS wage,
    CASE 
      WHEN a.wage > e.basic_wage THEN 1 
      ELSE 0 
    END AS overtime
  FROM 
    employees e
  JOIN 
    attendance a ON e.employee_id = a.employee_id
  WHERE 
    e.status = "Working"
    AND a.date = ?
  GROUP BY 
    e.employee_id, e.name, e.basic_wage, a.wage
`;

    const presentQuery = `
  SELECT 
    e.employee_id, 
    e.name, 
    e.basic_wage AS base_wage,
    a.wage AS wage,
    w.workplace_name,
    CASE 
      WHEN a.wage > e.basic_wage THEN 1 
      ELSE 0 
    END AS overtime
  FROM 
    employees e
  JOIN 
    attendance a ON a.employee_id = e.employee_id
  JOIN 
    workplaces w ON a.workplace_id = w.workplace_id
  WHERE 
    a.date = ?
    AND e.status = "Working"
    AND a.status = "Present"
`;

    db.query(totalQuery, [today], (err, allEmployees) => {
      if (err) return res.status(500).json({ error: err });
      console.log("All Employees:", allEmployees);
      db.query(presentQuery, [today], (err, presentEmployees) => {
        if (err) return res.status(500).json({ error: err });

        const presentIds = presentEmployees.map((e) => e.employee_id);
        const absentEmployees = allEmployees.filter(
          (e) => !presentIds.includes(e.employee_id)
        );

        res.json({
          present: presentEmployees.length,
          absent: absentEmployees.length,
          total: allEmployees.length,
          presentEmployees,
          absentEmployees,
        });
      });
    });
  });
});

app.get("/stats/weekly", (req, res) => {
  const workplaceId = req.query.workplace;

  const last7Days = Array.from({ length: 7 }).map((_, i) =>
    moment()
      .subtract(6 - i, "days")
      .format("YYYY-MM-DD")
  );

  const query = `
    SELECT 
      DATE(a.date) AS date,
      SUM(a.status = 'Present') AS present,
      SUM(a.status = 'Absent') AS absent
    FROM attendance a
    JOIN employees e ON a.employee_id = e.employee_id
    WHERE 
       a.date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      AND e.status = 'Working'
    GROUP BY DATE(a.date)
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const dataMap = {};
    rows.forEach((row) => {
      const date = moment(row.date).format("YYYY-MM-DD");
      dataMap[date] = {
        date,
        present: parseInt(row.present || 0),
        absent: parseInt(row.absent || 0),
      };
    });

    const finalData = last7Days
      .filter((date) => dataMap[date])
      .map((date) => ({
        ...dataMap[date],
        total: dataMap[date].present + dataMap[date].absent,
      }));

    res.json(finalData);
  });
});
// GET Route: Display deduction form
app.get("/deduction", (req, res) => {
  const selectedMonth = req.query.month;
  const selectedYear = req.query.year;

  db.query("SELECT employee_id, name FROM employees", (err, employees) => {
    if (err) return res.status(500).send("Error fetching employees.");

    let query = `
      SELECT deduction.*, employees.name 
      FROM deduction
      INNER JOIN employees ON deduction.employee_id = employees.employee_id
    `;

    const params = [];

    if (selectedMonth && selectedYear) {
      query += " WHERE MONTH(date) = ? AND YEAR(date) = ?";
      params.push(selectedMonth, selectedYear);
    }

    db.query(query, params, (err, deductions) => {
      if (err) return res.status(500).send(err);
      res.render("deductionForm", {
        deductions,
        employees,
        selectedMonth,
        selectedYear,
      });
    });
  });
});

// Handle form submission for adding a deduction
app.post("/deduction", (req, res) => {
  const { employee_id, date, amount, remarks } = req.body;

  if (!employee_id) {
    return res.status(400).send("Employee must be selected.");
  }

  const deductionQuery = `INSERT INTO Deduction (employee_id, date, amount, remark) VALUES (?, ?, ?, ?)`;

  db.query(deductionQuery, [employee_id, date, amount, remarks], (err) => {
    if (err) {
      console.error("Error inserting deduction:", err);
      return res.status(500).send("Error inserting deduction");
    }
    res.redirect("/deduction");
  });
});

// Handle deduction deletion
app.post("/deduction/delete", (req, res) => {
  const { deduction_id } = req.body;

  if (!deduction_id) {
    return res.status(400).send("Deduction ID is required.");
  }

  const deleteQuery = "DELETE FROM Deduction WHERE deduction_id = ?";
  db.query(deleteQuery, [deduction_id], (err) => {
    if (err) {
      console.error("Error deleting deduction:", err);
      return res.status(500).send("Error deleting deduction");
    }
    res.redirect("/deduction");
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
