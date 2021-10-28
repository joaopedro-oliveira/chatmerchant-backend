import { UsernameCpfInput } from "src/resolvers/UsernameCpfInput";

export const validateRegister = (options: UsernameCpfInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid Email.",
      },
    ];
  }
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Username must be bigger than 2 characters",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Cannot include an @",
      },
    ];
  }

  if (options.cpf.length <= 3) {
    return [
      {
        field: "cpf",
        message: "cpf must be bigger than 3 characters",
      },
    ];
  }

  return null;
};
