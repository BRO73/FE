import fetcher from "./fetcher";


export const menuApi = {
    getAllMenuItems: async () => {
        const response = await fetcher.get("/menu-items");
        return response.data;
      },
}