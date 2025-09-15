export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid email format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Here you would typically send the email using a service like:
    // - SendGrid
    // - Mailgun
    // - Resend
    // - Or your preferred email service

    // For now, we'll just log the contact form submission
    console.log("Contact form submission:", {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would:
    // 1. Send an email notification to yourself
    // 2. Send a confirmation email to the user
    // 3. Store the submission in a database

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Message sent successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
