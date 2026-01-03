require("dotenv").config();

const host = process.env.HOST || "http://localhost:5000";

exports.config = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.MONGO_URL || "",
  host,
  sessionSecret: process.env.SESSION_SECRET || "very-secure-secret",
  jwtSecret: process.env.JWT_SECRET,
  // basic information about the site
  site_info: {
    name: "",
    description: "",
    keywords: "",
    url: host,
    logo: "",
    logo_url: ``,
    email: "",
    phone: "",
    address: "",
  },
  email: {
    host: process.env.EMAIL_HOST || "",
    port: process.env.EMAIL_PORT || 465,
    support_email_user: process.env.SUPPORT_EMAIL_USER || "",
    support_email_pass: process.env.SUPPORT_EMAIL_PASS || "",
  },
};
