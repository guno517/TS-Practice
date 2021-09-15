
export default class NewsDetailView extends View {
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
  