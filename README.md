"PADY SOFTWARE"

## Description

PADY SOFTWARE is a healthcare application designed to reduce hospital wait times and streamline payment processes, with a primary focus on improving healthcare services in Rwanda.

## Features

Dashboard: Get an overview of essential metrics and activities in a visually appealing format.
Patient Management: Efficiently manage patient records, appointments, and medical history.
Hospital Management: Organize and optimize hospital operations, resources, and services.
Patient Testing: Schedule and track patient testing and diagnostic procedures.
Operation Theater: Monitor and manage operation theater schedules and availability.
Staff Management: Handle staff information, roles, and attendance records.
User Management: Control access and permissions for different users within the system.
Doctor Management: Manage doctor profiles, specialties, and assignments.
Staff Attendance: Track staff attendance and generate attendance reports.
Patient Reports: Generate and access patient medical reports securely.
Profile: Users can view and update their profiles.

## Target Users

- Patients - Book appointments, access records, pay bills digitally
- Doctors - Manage schedules, view patient history, generate reports
- Nurses - Track tests, update patient information, assist operations
- Administrators - Oversee operations, manage staff, generate analytics
- Hospital Management - Monitor performance, optimize resources

## Local Development

To set up the application for local development:

1. Clone the repository:
   ```bash
   git clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file based on the provided `.env.example`.
   - Update the variables with your specific configurations.

4. Ensure your database (PostgreSQL) is running.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Access the API documentation:
   - Open your browser and go to [http://localhost:7001/api-docs/](http://localhost:7001/api-docs/).
   - A small deployment has been made [https://rumunyana.github.io/PADY/]

## Deployment

To deploy the application:

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Database Migrations

If you are using PostgreSQL:

- Run migrations:
  ```bash
  npm run migrate
  ```

- Undo migrations:
  ```bash
  npm run undo-migrate
  ```

## Author and Acknowledgement

Created by PADY