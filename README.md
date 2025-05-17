# Asset Management System

A comprehensive asset management system built with Angular that helps organizations track, manage, and maintain their IT assets efficiently.

## 🌟 Features

-   **User Management**

    -   Role-based access control (Admin, Support, User)
    -   User profile management
    -   Password management

-   **Asset Tracking**

    -   Computer inventory management
    -   Software license tracking
    -   Hardware component tracking
    -   Asset sealing and verification

-   **Ticket System**

    -   Create and manage support tickets
    -   Track ticket status and history
    -   Assign tickets to support staff
    -   Ticket categorization and prioritization

-   **Product Management**

    -   Product categorization
    -   Product feature management
    -   Custom attribute definitions
    -   Product delivery tracking

-   **Building & Zone Management**
    -   Building information management
    -   Zone/Area tracking
    -   Support staff assignment to buildings

## 🛠️ Technology Stack

-   **Frontend Framework**: Angular 17.3.0
-   **UI Components**: Angular Material 17.3.10
-   **Date Handling**: Jalali Moment (Persian Calendar Support)
-   **State Management**: Angular Services
-   **HTTP Client**: Angular HttpClient
-   **Forms**: Reactive Forms

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)
-   Angular CLI (v19)

### Installation

1. Clone the repository:

```bash
git clone git@github.com:assetManagementAZ/frontend.git
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
ng serve
```

4. Navigate to `http://localhost:4200/` in your browser

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── Panel/           # Main application panels
│   │   ├── Services/        # Core services
│   │   ├── Shared/          # Shared components
│   │   └── ...
│   ├── assets/             # Static assets
│   └── ...
├── package.json
└── ...
```

## 🔧 Configuration

The application uses environment files for configuration. Make sure to set up your environment variables in:

-   `src/environments/environment.ts` (development)
-   `src/environments/environment.prod.ts` (production)

## 🧪 Testing

Run the test suite:

```bash
ng test
```

## 📦 Building for Production

```bash
ng build --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

-   Your Name - Initial work

## 🙏 Acknowledgments

-   Angular Team
-   Angular Material Team
-   Jalali Moment Contributors
