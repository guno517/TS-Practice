import {RouteInfo} from '../types'
import View from './view';

export default class Router { // 역할: hash가 바뀌었을 때 해당하는 페이지를 보여주는 것
    private isStart: boolean;
    routeTable: RouteInfo[];
    defaultRoute: RouteInfo | null;
  
    constructor() {
  
      window.addEventListener("hashchange", this.route.bind(this)); //hash값을 받아 알맞는 라우터를 찾고 보여줄 화면을 지정한다
  
      this.isStart = false;
      this.routeTable = [];
      this.defaultRoute = null;
    }
  
    setDefaultPage(page: View, params: RegExp | null = null): void{
      this.defaultRoute = {path: '', page, params,}
    }
  
    addRoutePath(path: string, page: View, params: RegExp | null = null): void{
      this.routeTable.push({path, page, params});

      if (!this.isStart) {
        this.isStart = true;
        setTimeout(this.route.bind(this), 0);
      }
    }
  
    private route() {
      const routePath: string = location.hash;
  
      if(routePath === '' && this.defaultRoute){
        this.defaultRoute.page.render();
        return;
      }
  
      for(const routeInfo of this.routeTable) {
        if(routePath.indexOf(routeInfo.path) >= 0) {
          if(routeInfo.params) {
            const parseParams = routePath.match(routeInfo.params);

            if(parseParams) {
              routeInfo.page.render.apply(null, [parseParams[1]]);
            }
          } else {
            routeInfo.page.render();
          }
          return;
        }
      }
    }
  }