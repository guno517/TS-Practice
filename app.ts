type Store = { // 타입 알리아스 type alias
    currentPage: number; // 세미콜론
    feeds: NewsFeed[];
}

type NewsFeed = {
    id: number;
    comments_count: number;
    url: string;
    time_ago: string;
    points: number;
    title: string;
    read?: boolean; // ?는 선택 속성을 의미
}

type NewsDetail = {
    id: number;
    time_ago: string;
    title: string;
    url: string;
    user: string;
    content: string;
    comments: [];
}

type NewsComment = {
    
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content: HTMLDivElement = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json"; // 해커 뉴스 news 1페이지
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // @id를 통해 뉴스 기사 고유의 id를 파악해 해당 뉴스 기사의 json을 가져온다
const store: Store = {
  currentPage: 1,
  feeds: [], //글 읽음 표시 유무를 위한 배열
};

function getData(url: string) {
  // 데이터를 가져오는 함수 생성
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

function updateView(html){
    if(container !== null){
        container.innerHTML = html;
    } else {
        console.error('최위 컨테이너가 없어 UI를 진행하지 못합니다.')
    }
}

function newsFeed() {
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  let template = `
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

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL)); //
  }

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
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace("{{__next_page__}}", store.currentPage + 1);

  updateView(template);
}

const ul = document.createElement("ul");

function newsDetail() {
  // 제목을 클릭 할 때마다 해시 값이 바껴 haschange 함수가 호출된다. -> 내용 화면으로 진입하는 시점(hashchange)
  const id = location.hash.substr(7); //주소와 관련된 정보 제공, substr: () 안의 값 이후부터 끝가지 문자열 출력
  const newsContent = getData(CONTENT_URL.replace("@id", id));
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

  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
          <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>   
          `);

      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1)); // 재귀함수를 사용해서 대댓글 기능 구현(끝을 알 수 없는 구조에서 유용)
        // 댓글이 몇번 호출 되었는지 체크하여 대댓글의 UI를 바꾼다(윗 댓글보다 padding이 더 들어가도록)
      }
    }

    return commentString.join("");
  }
  
  updateView(template.replace(
    "{{__comments__}}",
    makeComment(newsContent.comments)
  )
  );
}

function router() {
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
