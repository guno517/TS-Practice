import { CONTENT_URL, NEWS_URL } from '../config';
import { NewsFeed, NewsDetail} from '../types'

export class Api { // 개념 보완 부분
    xhr: XMLHttpRequest;
    url: string;
  
    constructor(url: string) {
      this.xhr = new XMLHttpRequest();
      this.url = url;
    }

    async request<AjaxResponse>(): Promise<AjaxResponse>{  
      const response = await fetch(this.url);
      return await response.json() as AjaxResponse;
    }
  }
  
  export class NewsFeedApi extends Api{
    constructor(){
      super(NEWS_URL);
    }

    async getData(): Promise<NewsFeed[]> {
      return this.request<NewsFeed[]>();
    }
  }
  
  export class NewsDetailApi extends Api{
    constructor(id: string){
      super(CONTENT_URL.replace('@id',id));
    }

    async getData(): Promise<NewsDetail> {
      return this.request<NewsDetail>();
    }
  }
  