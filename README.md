# 🏠 Hostel & Mess Management System

A modern and simple **Hostel & Mess Management System** designed to manage students, rooms, meal attendance, grocery expenses, mess deposits, miscellaneous expenses, household bills, and monthly mess settlements.

The application is completely **frontend-based** and uses the browser's **Local Storage** for data persistence. No backend, database, login system, or installation is required.

---

## 🌐 Live Demo

🚀 **Live Website:**
https://mdriyan143.github.io/hostel-management-system/

Explore the live application and manage:

* 👨‍🎓 Students
* 🚪 Rooms
* 🍽️ Meal Attendance
* 📅 Meal Overview
* 📊 Meal Rate Breakdown
* 💰 Contribution Overview
* 🛒 Grocery Expenses
* 💵 Mess Deposits
* 📦 Bibidh Expenses
* 🧮 Monthly Mess Calculations
* 🏠 Household Bills

---

## ✨ Features

### 📊 Dashboard

Get a quick overview of the hostel and mess system, including:

* Total number of students
* Room occupancy and capacity
* Students marked present
* Full or nearly full rooms

---

### 👨‍🎓 Student Management

Manage all hostel residents easily.

* Add students
* View student records
* Assign students to rooms
* Manage student information

---

### 🚪 Room Management

Manage hostel rooms and their capacity.

* Add and manage rooms
* Set room capacity
* Set individual room rent
* Assign students to rooms
* Monitor room occupancy

---

### 🍽️ Mess Attendance

Track daily meal attendance for every student.

The system supports weighted meals:

| Meal         | Weight |
| ------------ | ------ |
| 🥣 Breakfast | 0.5    |
| 🍛 Lunch     | 1      |
| 🍽️ Dinner   | 1      |

The attendance system allows tracking of:

* Breakfast
* Lunch
* Dinner
* Daily weighted meal totals

---

### 📅 Meal Overview

View a complete monthly meal overview using a calendar-style table.

Features include:

* One row for each student
* One column for each day of the month
* Daily weighted meal totals
* Monthly meal totals for each student
* Total meals consumed by the entire hostel
* Visual meal activity indicators

This makes it easy to review attendance and meal consumption before calculating the monthly mess settlement.

---

### 📊 Meal Rate Breakdown

View a detailed breakdown of how the monthly meal rate is calculated.

The system considers:

* Personal grocery expenses
* Manager or shared grocery expenses
* Total grocery spending
* Total meals consumed
* Calculated meal rate

The meal rate is automatically calculated using:

```text
Meal Rate = Total Grocery Cost ÷ Total Meals
```

---

### 💰 Contribution Overview

Monitor each person's financial contribution to the mess.

The system automatically displays:

* Total deposited money
* Personal grocery spending
* Individual contribution amount
* Contribution status

Students whose contributions are significantly lower than the group average can easily be identified.

---

### 🛒 Grocery Expense Management

Track grocery purchases made by individual students.

For every grocery entry, you can record:

* Person who paid
* Grocery amount
* Optional note
* Selected month

The system also supports shared or manager grocery expenses.

All grocery expenses are included in the final mess calculation.

---

### 💵 Mess Deposits

Track how much money each person deposits into the shared mess fund.

The system supports:

* Multiple deposits per person
* Monthly deposit tracking
* Automatic total calculation

---

### 📦 Bibidh (Miscellaneous Expenses)

Manage shared miscellaneous expenses such as:

* Extra household items
* Small shared expenses
* Other mess-related costs

Bibidh expenses are divided equally among all students during the monthly settlement.

---

### 🧮 Monthly Mess Settlement

Calculate the final monthly mess settlement for every student.

The calculation considers:

* Total meals consumed
* Individual meal cost
* Total grocery expenses
* Mess deposits
* Personal grocery contributions
* Bibidh expense share

The system automatically calculates each person's final balance.

#### 📈 Settlement Result

* 💚 **Positive Balance** → The person gets money back
* 🔴 **Negative Balance** → The person needs to pay more

---

## 🏘️ Household Bills

Household bills are managed separately from mess calculations.

The system supports:

* 🏠 Room rent
* 💧 Water bills
* 🔥 Gas bills
* ⚡ Electricity bills
* 🍳 Cooking-related bills

Each student's applicable share can be calculated separately from the monthly mess settlement.

---

## 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript (ES6+)
* Browser Local Storage

---

## 💾 Data Storage

This project uses the browser's **Local Storage**.

That means:

* No backend server is required
* No database setup is required
* No login system is required
* Data is saved locally in the browser
* The application can work without an internet connection after loading the files

> ⚠️ **Important:** Data is browser-specific. Clearing browser storage may remove all saved records.

---

## 📂 Project Structure

```text
hostel-mess-management-system/
│
├── index.html
├── students.html
├── rooms.html
├── attendance.html
├── overview.html
├── contribution.html
├── billing.html
├── calculation.html
├── meal-rate.html
│
├── css/
│   └── style.css
│
└── js/
    ├── store.js
    ├── nav-toggle.js
    ├── students.js
    ├── rooms.js
    ├── attendance.js
    ├── overview.js
    ├── contribution.js
    ├── billing.js
    ├── calculation.js
    └── meal-rate.js
```

---

## 📖 Recommended Workflow

For the best experience, use the system in the following order:

### 1️⃣ Add Rooms

Create hostel rooms with:

* Room number
* Capacity
* Monthly rent

---

### 2️⃣ Add Students

Add students and assign them to their respective rooms.

---

### 3️⃣ Track Daily Attendance

Record each student's:

* Breakfast
* Lunch
* Dinner

---

### 4️⃣ Record Grocery Expenses

Whenever someone purchases groceries, record:

* Person's name
* Amount
* Optional note

You can also record shared or manager grocery expenses.

---

### 5️⃣ Record Mess Deposits

Add each person's deposits to the shared mess fund.

---

### 6️⃣ Add Bibidh Expenses

Record shared miscellaneous expenses.

---

### 7️⃣ Review Meal Rate

Check:

* Total grocery expenses
* Total meals
* Monthly meal rate

---

### 8️⃣ Calculate Monthly Settlement

At the end of the month:

* Select the month
* Calculate the settlement
* Review meals and expenses
* Check individual contributions
* View the final balances

---

## 🎯 Future Improvements

Possible future features include:

* 🔐 User authentication
* ☁️ Cloud database integration
* 🔥 Firebase integration
* 👥 Multiple user access
* 🌐 Real-time shared hostel data
* 📱 Improved mobile responsiveness
* 📊 Advanced analytics and charts
* 📄 Monthly bill export as PDF
* 📥 Excel export
* 🔔 Payment and deposit notifications

---

## 👨‍💻 Author

Developed by **Md Riyan Biswas**

---

⭐ If you find this project useful, consider giving the repository a star!
