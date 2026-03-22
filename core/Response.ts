
export const Response = {
  json: (data: any, status: number = 200) => {
    if (Array.isArray(data)) {
      return {
        status,
        data: data,
        success: status >= 200 && status < 300
      };
    }
    
    return {
      status,
      ...data,
      success: data.success !== undefined ? data.success : (status >= 200 && status < 300)
    };
  }
};
