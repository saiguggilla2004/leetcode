const validator=require("validator")
const validate=(data)=>{
  const mandatoryFields=['firstName','emailId','password'];
  const isAllowed=mandatoryFields.every((field)=>{
    return Object.keys(data).includes(field);
  });

  if(!isAllowed)
  {
    throw new Error("missing some mandatory fields");
  }

  if(!validator.isEmail(data.emailId))
  {
    throw new Error("invalid email");
  }

//   if(!validator.isStrongPassword(data.password))
//   {
//     throw new Error("password is not strong");
//   }



}

module.exports = validate;