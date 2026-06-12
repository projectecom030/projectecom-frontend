const getApiOrigin = () => {
  const apiBase = process.env.REACT_APP_API_URL ;
  return apiBase.replace(/\/api\/?$/, "");
};

export const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return value;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const origin = getApiOrigin();
  if (value.startsWith("/")) {
    return `${origin}${value}`;
  }

  return `${origin}/${value}`;
};