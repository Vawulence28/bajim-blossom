const API_BASE_URL = "/api";

async function request(endpoint, options = {}) {
const response = await fetch(
`${API_BASE_URL}${endpoint}`,
{
...options,
credentials: "include",
headers: {
"Content-Type": "application/json",
...(options.headers || {})
}
}
);

let data = null;

try {
    data = await response.json();
} catch {
    data = null;
}

if (!response.ok || data?.success === false) {
    const error = new Error(
        data?.message ||
            `Request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.data = data;

    throw error;
}

return data;
}

/**

* Public organization contact information.
  */
  export async function getPublicContactInfo() {
  return request("/contact/info");
  }

/**

* Submit a public contact enquiry.
  */
  export async function submitContactEnquiry({
  fullName,
  email,
  message
  }) {
  return request("/contact/enquiries", {
  method: "POST",
  body: JSON.stringify({
  fullName,
  email,
  message
  })
  });
  }

/**

* Get contact enquiries for administrators.
  */
  export async function getContactEnquiries({
  status = "",
  search = "",
  limit = 50,
  offset = 0
  } = {}) {
  const params = new URLSearchParams();

  if (status) {
  params.set("status", status);
  }

  if (search) {
  params.set("search", search);
  }

  params.set("limit", String(limit));
  params.set("offset", String(offset));

  return request(
  `/contact/admin/enquiries?${params.toString()}`
  );
  }

/**

* Get one contact enquiry.
  */
  export async function getContactEnquiry(id) {
  return request(
  `/contact/admin/enquiries/${encodeURIComponent(id)}`
  );
  }

/**

* Update an administrator's contact enquiry.
  */
  export async function updateContactEnquiry(
  id,
  {
  status,
  adminNotes
  }
  ) {
  return request(
  `/contact/admin/enquiries/${encodeURIComponent(id)}`,
  {
  method: "PATCH",
  body: JSON.stringify({
  status,
  adminNotes
  })
  }
  );
  }
