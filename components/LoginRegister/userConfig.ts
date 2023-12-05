// 注册时候需要的字段
// login_name，password，first_name，last_name，location，description，occupation
export const fieldConfigs = [
  {
    key: "login_name",
    label: "登录名",
    autoFocus: true,
    required: true,
  },
  {
    key: "password",
    label: "密码",
    required: true,
    autoComplete: "new-password",
    type: "password",
  },
  {
    key: "confirmPassword",
    label: "确认密码",
    required: true,
    autoComplete: "new-password",
    type: "password",
  },
  {
    key: "last_name",
    label: "姓",
    required: true,
  },
  {
    key: "first_name",
    label: "名",
    required: true,
  },
  {
    key: "occupation",
    label: "职业",
  },
  {
    key: "location",
    label: "位置",
  },
  {
    key: "description",
    label: "描述",
  },
];
