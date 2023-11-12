# parkview

The parkview project was developed as part of the coursework for the **SC2006 (Software Engineering)** module at Nanyang Technological University (NTU), Singapore. 

<p align="center">
   <img src="https://github.com/yijisuk/parkview.frontend/assets/63234184/2feef444-63d1-4d49-a018-71f8f377e830" alt="logo" width="300"/>
</p>

**The mobile application is designed to enhance the parking experience by guiding users to the optimal parking location based on their destination and personal preferences. Users can input their intended destination, and parkview will suggest the most suitable parking spot, taking into consideration factors such as proximity and availability.**

**Main features** of the app are:
- Optimal parking spot suggestions based on destination and personal preferences
- Favorites feature to bookmark commonly used destinations
- Integrates with built-in navigation apps (Apple Maps for iOS, Google Maps for Android)
- Customizable user preference settings for parking recommendations (availability, cost, weather)
- Minimalist, driver-friendly interface with voice-activated search by our intelligent assistant, DOM

This is the backend repository. The frontend repository is accessible [here](https://github.com/yijisuk/parkview.frontend).

Check the app demo video [here](https://youtu.be/Vpp5BNTWsqc).

## Tech Stack

**[Frontend](https://github.com/yijisuk/parkview.frontend)**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)

**[Backend](https://github.com/yijisuk/parkview.backend)**: [Node.js](https://nodejs.org/en/) & [Supabase](https://supabase.com/)

## Get the server running

1. Ensure essential libraries and frameworks for the tech stack mentioned above are properly installed on the machine.

2. Install the essential packages from npm:

   ```npm install```

3. Create a ```.env``` file on the root directory to store environment variables - mainly credentials and api keys.

- Using Mac/Linux: ```touch .env```

- Using Windows: ```echo. > .env```

  Details to be included on ```.env``` are:
  ```MARKDOWN
  PARKVIEW_SUPABASE_URL=[PROJECT URL of the Supabase DB]
  PARKVIEW_ANNON_KEY=[ANNON KEY for the Supabase DB]
  PARKVIEW_SERVICE_ROLE_KEY=[SERVICE ROLE KEY for the Supabase DB]
  PARKVIEW_STORAGE_BUCKET=[STORAGE BUCKET NAME to store files on Supabase DB]
  
  GOOGLE_API_KEY=[Google Cloud API Key]
  HFACE_API_KEY=[HuggingFace Inference API Key]
  OPENAI_API_KEY=[OpenAI API Key]

  LTA_API_KEY=[LTA API Key]
  URA_ACCESS_KEY=[URA Access Key]
  URA_TOKEN=[URA Access Token]
  ```

  Visit the following websites:

  - [Supabase](https://supabase.com/) to create a new database project, and get the respective details for PARKVIEW_SUPABASE_URL, ANNON_KEY, SERVICE_ROLE_KEY, and STORAGE_BUCKET

  - [Google Cloud Platform](https://cloud.google.com) to get the API key to access Google Cloud API services
 
  - [HuggingFace](https://huggingface.co/) to get the API key to access the HuggingFace Inference APIs
 
  - [OpenAI](https://platform.openai.com/) to get the API key to access the OpenAI APIs
 
  - [LTA](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html) to get the API key to access the LTA Dataset & APIs
 
  - [URA](https://www.ura.gov.sg/maps/api/#car-park-list-and-rates) to get the API key to access the URA APIs
 
  - [URA Token Generator](http://www.ura.gov.sg/uraDataService/getToken.jsp?) to generate a one-day access token to the URA APIs; would need a URA API key first for token generation

4. Run the backend server.

   ```npm run server```

## Acknowledgement
This repository is publicly available for the purpose of reference. We discourage direct duplication of this code base. In keeping with the open source community ethos, users should give appropriate credit and abide by the terms set forth in the project license when using this project as a reference.
