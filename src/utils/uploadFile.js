import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

cloudinary.config({
  cloud_name: "dbsz3mavr",
  api_key: "915478994222199",
  api_secret: "AKNufDumrVMKglUJI7HONdUHb9s",
});

export const uploadSingleFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer || !file.mimetype) {
      return reject(
        new Error("The file dose not exist or is in the not correct format ")
      );
    }

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    cloudinary.uploader.upload(
      dataUrl,
      {
        public_id: uuidv4(),
        resource_type: "auto",
        folder: "product_images",
      },
      (err, result) => {
        if (err) {
          return reject(
            new Error("Error when uploading file to cloudinary!! " + err)
          );
        }

        return resolve({
          url: result.url,
          public_id: result.public_id,
        });
      }
    );
  });
};

export const uploadMultipleFiles = async (files) => {
  return new Promise((resolve, reject) => {
    if (!files || files.length === 0) {
      return reject(new Error("No files have been uploaded!!"));
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolveFile, rejectFile) => {
        if (!file || !file.buffer || !file.mimetype) {
          return reject(
            new Error(
              "The file dose not exist or is in the not correct format "
            )
          );
        }
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;
        const fileName = file.originalname.split(".")[0];

        cloudinary.uploader.upload(
          dataUrl,
          {
            public_id: uuidv4(),
            resource_type: "auto",
            folder: "product_images",
          },
          (err, result) => {
            if (err) {
              return rejectFile(
                new Error(
                  `Lỗi khi tải lên Cloudinary cho file ${file.originalname}: ${err.message}`
                )
              );
            }
            // Trả về URL an toàn của tệp trên Cloudinary
            resolveFile({
              url: result.url,
              public_id: result.public_id,
            });
          }
        );
      });
    });

    // Chờ tất cả các file upload hoàn tất
    Promise.all(uploadPromises)
      .then((urls) => resolve(urls))
      .catch((err) => reject(err));
  });
};
