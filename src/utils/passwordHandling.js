import bcrypt from "bcrypt";

const sartRounds = 10;
const passwordHandling = {
  //mã hóa mật khẩu
  hashing: (password) => {
    //Tạo chuỗi ngẫu nhiên
    const sart = bcrypt.genSaltSync(sartRounds);

    //Thực hiện mã hóa vơi chuỗi sart
    const hash = bcrypt.hashSync(password, sart);

    return hash;
  },

  verify: async (plainTextPassword, hashedPassword) => {
    //kiểm tra mật khẩu
    try {
      const result = await bcrypt.compare(plainTextPassword, hashedPassword);
      return result;
    } catch (err) {
      return "500";
    }
  },
};

export default passwordHandling;
