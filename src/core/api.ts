export class Api { // 개념 보완 부분
    ajax: XMLHttpRequest;
    url: string;
  
    constructor(url: string) {
      this.ajax = new XMLHttpRequest();
      this.url = url;
    }
  
    getRequest<AjaxResponse>(): AjaxResponse{  
      this.ajax.open("GET", this.url, false);
      this.ajax.send();
  
      return JSON.parse(this.ajax.response);
    }
  }
  export class NewsFeedApi extends Api{
    getData(): NewsFeed[] {
      return this.getRequest<NewsFeed[]>();
    }
  }
  
  export class NewsDetailApi extends Api{
    getData(): NewsDetail {
      return this.getRequest<NewsDetail>();
    }
  }
  