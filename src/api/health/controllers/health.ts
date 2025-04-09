export default {
  async index(ctx) {
    const data = {
      status: "ok",
      message: "Server up and running",
    };

    ctx.body = data;
  },
};
