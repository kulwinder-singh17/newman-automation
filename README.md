# Newman Collection Runner

This framework automates the execution of multiple Postman collections using Newman and generates detailed HTML reports. It recursively retrieves all collection files from the `collections` folder and executes them sequentially using the specified environment configuration.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Newman](https://github.com/postmanlabs/newman) installed globally:
  ```bash
  npm install -g newman
  ```
  
## Installation
1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```

## Project Structure
 ```bash
/collections         # Folder for Postman collection JSON files
/environment         # Folder for environment JSON files
index.js             # Main script to execute collections
newman.js            # Newman execution logic
config.js            # Configuration file for environment selection
```

## Usage
1. Add your Postman collections to the `collections` folder.
2. Add your environment JSON to the `environment` folder.
3. Update the `envFile_name` in `config.js` with your environment file name.
4. Run the script:
   ```bash
   node index.js
   ```

## Reports
HTML reports will be generated in the `report` folder, organized by date.

## License
This script is licensed under the Apache License. See [LICENSE.md](LICENSE.md) for more details.
