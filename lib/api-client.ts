export const esg = {
  getSubmissions: async (params?: { type?: string }) => {
    const filteredSubmissions = await fetch("/api/esg/submissions", {
      method: "POST",
      body: JSON.stringify(params),
    });

    const submissions = await filteredSubmissions.json();


    //   const mockSubmissions: Submission[] = [
    //     {
    //       id: "1",
    //       type: "ENVIRONMENTAL",
    //       status: "PENDING",
    //       submittedAt: new Date().toISOString(),
    //       reviewedAt: null,
    //       reviewerId: null,
    //       reviewer: null,
    //       rejectionReason: null,
    //       companyId: "acme",
    //       company: { name: "Acme Corp" },
    //     },
    //   ];
    //   {
    //     id: "2",
    //     type: "SOCIAL",
    //     status: "APPROVED",
    //     submittedAt: new Date().toISOString(),
    //     reviewedAt: new Date().toISOString(),
    //     reviewerId: "reviewer1",
    //     reviewer: { name: "Dr. Emma Chen" },
    //     rejectionReason: null,
    //     companyId: "acme",
    //     company: { name: "Acme Corp" },
    //   },
    //   {
    //     id: "3",
    //     type: "GOVERNANCE",
    //     status: "REJECTED",
    //     submittedAt: new Date().toISOString(),
    //     reviewedAt: new Date().toISOString(),
    //     reviewerId: "reviewer2",
    //     reviewer: { name: "Michael Rodriguez" },
    //     rejectionReason: "Data is inaccurate",
    //     companyId: "acme",
    //     company: { name: "Acme Corp" },
    //   },
    // ];

    return submissions;
  },

  submitData: async (data: any) => {
    // In a real application, this would send data to an API.
    await fetch("/api/esg/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return Promise.resolve();
  },

  reviewSubmission: async (data: any) => {
    // In a real application, this would send data to an API.
    console.log("Reviewing submission:", data);
    return Promise.resolve();
  },

  getScores: async () => {
    const scores = await fetch("/api/esg/scores");
    const data = await scores.json();
    // Mock implementation for demonstration purposes.
    return data;
  },
};

export const auth = {
  register: async (data: any) => {
    // In a real application, this would send data to an API.
    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return Promise.resolve();
  },
};
