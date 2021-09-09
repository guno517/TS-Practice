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

const ajax: XMLHttpRequest = new XMLHttpRequest();
const content: HTMLDivElement = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json"; // 해커 뉴스 news 1페이지
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // @id를 통해 뉴스 기사 고유의 id를 파악해 해당 뉴스 기사의 json을 가져온다
const store: Store = {
  currentPage: 1,
  feeds: [], //글 읽음 표시 유무를 위한 배열
};

//믹스인 함수
function applyApiMixins(targetClass: any, baseClasses: any[]): void{
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);
      
      if(descriptor){
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    })
  });
}

class Api { // 개념 보완 부분
  getRequest<AjaxResponse>(url: string): AjaxResponse{  
    const ajax = new XMLHttpRequest();
    ajax.open("GET", url, false);
    ajax.send();

    return JSON.parse(ajax.response);
  }
}
class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
  }
}

class NewsDetailApi {
  getData(id: string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id',id));
  }
}

interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);
//상속에서 extends는 다중 상속을 지원하지 않는다. mixin은 가능하다.

class View {
  template: string;
  container: HTMLElement;

  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if(!containerElement) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다';
    }

    this.container = containerElement;
    this.template = template;
  }
  updateView(html: string): void{
        this.container.innerHTML = html;
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
    const newsList: string[] = [];
    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
      newsList.push(`
      <div class="p-6 ${
        newsFeed[i].read ? "bg-red-500" : "bg-white"
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
            newsFeed[i].comments_count
          }</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
          <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
          <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
        </div>  
      </div>
    </div>    
      `);
    }
  
    template = template.replace("{{__news_feed__}}", newsList.join(""));
    template = template.replace(
      "{{__prev_page__}}",
      String(store.currentPage > 1 ? store.currentPage - 1 : 1)
    );
    template = template.replace("{{__next_page__}}", String(store.currentPage + 1));
  
    updateView(template);
    }

    makeFeeds(): void {
      for (let i = 0; i < this.feeds.length; i++) {
        this.feeds[i].read = false;
      }
    }
}

class NewsDetailView extends View {
  constructor(){
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
  }
  render() {
    const id = location.hash.substr(7); //주소와 관련된 정보 제공, substr: () 안의 값 이후부터 끝가지 문자열 출력
    const api = new NewsDetailApi();
    const newsContent = api.getData(id);
    
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
  makeComment(comments: NewsComment[]): string {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
        const comment: NewsComment = comments[i];
      commentString.push(`
          <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>   
          `);

      if (comment.comments.length > 0) {
        commentString.push(makeComment(comment.comments)); // 재귀함수를 사용해서 대댓글 기능 구현(끝을 알 수 없는 구조에서 유용)
        // 댓글이 몇번 호출 되었는지 체크하여 대댓글의 UI를 바꾼다(윗 댓글보다 padding이 더 들어가도록)
      }
    }

    return commentString.join("");
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

function router(): void {
  //location.hash를 통해 지금 보고있는 화면의 위치 해시값을 받아 목록을 보여줄지 내용을 보여줄지 정한다.
  const routePath = location.hash;

  if (routePath === "") {
    newsFeed(); //routePath 값에 #만 있는 경우 빈 문자열을 출력한다.
  } else if (routePath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router); //hash값을 받아 알맞는 라우터를 찾고 보여줄 화면을 지정한다

router();
