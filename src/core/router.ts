
export default class Router { // 역할: hash가 바뀌었을 때 해당하는 페이지를 보여주는 것
    routeTable: RouteInfo[];
    defaultRoute: RouteInfo | null;
  
    constructor() {
  
      window.addEventListener("hashchange", this.route.bind(this)); //hash값을 받아 알맞는 라우터를 찾고 보여줄 화면을 지정한다
  
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
        this.defaultRoute.page.render();
      }
  
      for(const routeInfo of this.routeTable) {
        if(routePath.indexOf(routeInfo.path) >= 0) {
          routeInfo.page.render();
          break;
        }
      }
    }
  
  }
  