# Auto Comment on PR

A Node.js and Express.js application that automatically comments on pull requests using the Gemini API. This project aims to streamline the code review process by providing insightful comments based on the content of the pull request.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- Automatically generate comments for pull requests based on their content.
- Leverage the Gemini API for intelligent responses.
- Simple integration with existing GitHub repositories.

## Technologies Used

- **Node.js** - A JavaScript runtime for building server-side applications.
- **Express.js** - A web application framework for Node.js, used to build APIs.
- **Gemini API** - For generating intelligent comments on pull requests.
- **Axios** - For making HTTP requests to the Gemini API.
- **dotenv** - For managing environment variables.

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/auto-comment-pr.git
   cd auto-comment-pr
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API credentials:
   ```plaintext
   GEMINI_API_KEY=your_api_key
   GITHUB_TOKEN=your_github_token
   ```

4. **Run the application**:
   ```bash
   nodemon app.js
   ```

The server will start, and you can now configure it to listen for pull request events.

## Usage

1. Configure your GitHub repository to send webhooks for pull request events to your application.
2. The application will process the incoming pull request data and generate comments based on the changes made.
3. Comments will be automatically posted to the pull request.

## API Reference

### POST /api/comments

- **Description**: Automatically generates and posts comments on pull requests.
- **Request Body**:
  ```json
  {
    "pullRequestId": "123",
    "repository": "your-repo",
    "changes": "Description of changes made."
  }
  ```
- **Response**:
  - **200 OK**: Comment posted successfully.
  - **500 Internal Server Error**: Error in generating or posting the comment.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please fork the repository and create a pull request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Customization
- Make sure to replace `your-username` in the clone URL and any other placeholder text (like `your_api_key`, `your_github_token`, etc.) with your actual information.
- Adjust any sections to fit the specifics of your project, especially in the API reference if you have more endpoints or different payloads.

Feel free to modify any parts to better suit your project's needs!
