interface Store { // 타입 알리아스 type alias
    currentPage: number; // 세미콜론
    feeds: NewsFeed[];
}

interface News {
    readonly id: number; // readonly: 변경 불가 기능
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News { // intersection 기능 (중복 생략 가능)
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?는 선택 속성을 의미
}

interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

interface NewsComment extends News {
    readonly comments: NewsComment[];
    readonly level: number;
}

interface RouteInfo {
  path: string;
  page: View;
}

const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json"; // 해커 뉴스 news 1페이지
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // @id를 통해 뉴스 기사 고유의 id를 파악해 해당 뉴스 기사의 json을 가져온다
const store: Store = {
  currentPage: 1,
  feeds: [], //글 읽음 표시 유무를 위한 배열
};

class Api { // 개념 보완 부분
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
class NewsFeedApi extends Api{
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api{
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

abstract class View {
  template: string;
  renderTemplate: string;
  container: HTMLElement;
  htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if(!containerElement) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다';
    }

    //항상 초기화를 해주어야한다. 
    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }
  updateView(): void{
        this.container.innerHTML = this.renderTemplate;
        this.renderTemplate = this.template; // 원래 값으로 돌려놓는 용도로 사용
  }

  addHtml(htmlString: string): void{ // newsFeedView와 newsDetailView에서 사용된다.
    this.htmlList.push(htmlString);
  }

  getHtml(): string{
    const snapshot = this.htmlList.join('');
    this.clearHtmlList();
    return snapshot;
  }

  setTemplateDate(key: string, value: string): void{
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  clearHtmlList(): void {
    this.htmlList = [];
  }

  abstract render(): void; // 자식들에게 반드시 구현하라는 의미의 마킹 (추상메소드)
}

class Router { // 역할: hash가 바뀌었을 때 해당하는 페이지를 보여주는 것
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;

  constructor() {

    window.addEventListener("hashchange", router); //hash값을 받아 알맞는 라우터를 찾고 보여줄 화면을 지정한다

    this.routeTable = [];
    this.defaultRoute = null;
  }

  setDefaultPage(page: View): void{
    this.defaultRoute = {path: '', page}
  }

  addRoutePath(path: string, page: View): void{
    this.routeTable.push({path, page});
  }

  route() {
    const routePath = location.hash;

    if(routePath === '' && this.defaultRoute){
      this.defaultRoute.page.renderTemplate
    }

    for(const routeInfo of this.routeTable) {
      if(routePath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }

}

class NewsFeedView extends View{ // 클래스를 만든다는 것은 인스턴스를 만들어서 인스턴스에 필요한 정보들을 저장해 뒀다가 필요한 경우에 계속 재활용해서 쓸수 있다는 장점
  api: NewsFeedApi;
  feeds: NewsFeed[];
  
  constructor(containerId: string) {
    let template: string = `
  <div class="bg-gray-600 min-h-screen">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__prev_page__}}" class="text-gray-500">
            Previous
          </a>
          <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
            Next
          </a>
        </div>
      </div> 
    </div>
  </div>
  <div class="p-4 text-2xl text-gray-700">
    {{__news_feed__}}        
  </div>
</div>
    `;

    super(containerId, template);

    this.api = new NewsFeedApi(NEWS_URL); // 클래스 인스턴스
    this.feeds = store.feeds;

    if (this.feeds.length === 0) {
      this.feeds = store.feeds = this.api.getData();
      this.makeFeeds();
    }
  }

  render():void {
    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
      const {id, title, comments_count, user, points, time_ago, read} = this.feeds[i];
      this.addHtml(`
      <div class="p-6 ${
        read ? "bg-red-500" : "bg-white"
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${id}">${title}</a>  
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
            comments_count
          }</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${user}</div>
          <div><i class="fas fa-heart mr-1"></i>${points}</div>
          <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
        </div>  
      </div>
    </div>    
      `);
    }
  
    this.setTemplateDate("news_feed", this.getHtml());
    this.setTemplateDate(
      "prev_page",
      String(store.currentPage > 1 ? store.currentPage - 1 : 1)
    );
    this.setTemplateDate("next_page", String(store.currentPage + 1));
  
    this.updateView();
    }

    makeFeeds(): void {
      for (let i = 0; i < this.feeds.length; i++) {
        this.feeds[i].read = false;
      }
    }
}

class NewsDetailView extends View {
  constructor(containerId: string){
  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__currentPage__}}" class="text-gray-500">
            <i class="fa fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    <h2>{{__title__}}</h2>
    <div class="text-gray-400 h-20">
      {{__content__}}
    </div>

    {{__comments__}}

  </div>
</div>
  `;
  super(containerId, template);
  }
  render() {
    const id = location.hash.substr(7); //주소와 관련된 정보 제공, substr: () 안의 값 이후부터 끝가지 문자열 출력
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    const newsDetail: NewsDetail = api.getData();
    
  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }
  
  this.setTemplateDate("comments", this.makeComment(newsDetail.comments));
  this.setTemplateDate('currentPage', String(store.currentPage));
  this.setTemplateDate('title', newsDetail.title);
  this.setTemplateDate('content', newsDetail.content);

  this.updateView();
  }
  makeComment(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
        const comment: NewsComment = comments[i];
      this.addHtml(`
          <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>   
          `);

      if (comment.comments.length > 0) {
        this.addHtml(this.makeComment(comment.comments)); // 재귀함수를 사용해서 대댓글 기능 구현(끝을 알 수 없는 구조에서 유용)
        // 댓글이 몇번 호출 되었는지 체크하여 대댓글의 UI를 바꾼다(윗 댓글보다 padding이 더 들어가도록)
      }
    }

    return this.getHtml();
  }
}

const ul = document.createElement("ul");

function newsDetail(): void {
  // 제목을 클릭 할 때마다 해시 값이 바껴 haschange 함수가 호출된다. -> 내용 화면으로 진입하는 시점(hashchange)
  const id = location.hash.substr(7); //주소와 관련된 정보 제공, substr: () 안의 값 이후부터 끝가지 문자열 출력
  const api = new NewsDetailApi();
  const newsContent = api.getData(id);
  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/${store.currentPage}" class="text-gray-500">
            <i class="fa fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    <h2>${newsContent.title}</h2>
    <div class="text-gray-400 h-20">
      ${newsContent.content}
    </div>

    {{__comments__}}

  </div>
</div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }
  
  updateView(template.replace(
    "{{__comments__}}",
    makeComment(newsContent.comments)));
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addroutePath('/page/', newsFeedView);
router.addroutePath('/show/', newsDetailView);
