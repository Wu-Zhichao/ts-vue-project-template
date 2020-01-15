import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";
import Message from "iview";
import Router from "../router";
// default configuration
const defaultOptions: AxiosRequestConfig = {
  baseURL: process.env.NODE_ENV === "development" ? "/api" : "",
  timeout: 6000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
};
class Request {
  // request
  public request(options: AxiosRequestConfig) {
    options = Object.assign(defaultOptions, options);
    const instance: AxiosInstance = axios.create(options);
    this.interceptors(instance);
  }
  // upload
  public async upload(
    options: AxiosRequestConfig,
    callback: (progress: any) => void
  ): Promise<any> {
    const response: any = await this.request({
      url: options.url,
      method: options.method,
      data: options.data,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent: any) => {
        const { loaded, total } = progressEvent;
        callback(`${Math.round((loaded * 10000) / total) / 100}%`);
      }
    });
    const { status, data } = response;
    if (status === 200) return data;
  }
  // interceptors
  private interceptors(instance: AxiosInstance) {
    // request interceptors
    instance.interceptors.request.use((config: AxiosRequestConfig): any => {
      // has token ?
      const token: string | null = sessionStorage.getItem("token");
      token && (config.headers["Authorization"] = `Bearer ${token}`);
      return config;
    });
    // response interceptors
    instance.interceptors.response.use(
      (res: AxiosResponse): any => {
        const { status, data } = res;
        if (status === 200) Promise.resolve(data);
      },
      (error: any) => {
        const { status, data } = error.response;
        switch (status) {
          case 403:
            Message.info("认证过期，请登录后再操作!");
            Router.replace({ name: "login" });
            break;
          case 404:
            Message.info("找不到请求路径!");
            break;
          case 500:
            Message.info("服务端出错啦!");
            break;
        }
      }
    );
  }
}
export default new Request();
