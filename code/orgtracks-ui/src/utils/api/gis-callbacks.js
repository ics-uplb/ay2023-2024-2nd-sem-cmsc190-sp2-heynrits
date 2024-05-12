/**
 * Callback function after successful authentication with Google Identity Service.
 *
 * @param {Object} response - The response object from the server.
 * @return {Promise}
 */
export async function onRegister(response) {
  // Extract the credential from the response object
  const { credential } = response;

  try {
    // Send a POST request to the server with the credential
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/register`,
      {
        method: "POST",
        body: JSON.stringify({ credential }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the response data as JSON
    const data = await response.json();

    console.log("in onregister callback");
    console.log({ localStorage, window });

    // Check if the response status is not 201 (created)
    if (response.status !== 201) {
      // Display an alert with the error message
      alert(data.message);
      return;
    }

    // Store the token in the local storage
    localStorage.setItem("token", data.token);
    // Redirect to the home page with a welcome parameter
    window.location.replace("/home?welcome=true");
  } catch (error) {
    // Log any errors that occur during the registration process
    console.log(error);
  }
}

export async function onLogin(response) {
  const { credential } = response;

  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`,
      {
        method: "POST",
        body: JSON.stringify({ credential }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.status !== 200) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.replace("/home");
  } catch (error) {
    console.log(error);
  }
}
