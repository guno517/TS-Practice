
abstract class View {
    private template: string;
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[];
  
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
    protected updateView(): void{
          this.container.innerHTML = this.renderTemplate;
          this.renderTemplate = this.template; // 원래 값으로 돌려놓는 용도로 사용
    }
  
    protected addHtml(htmlString: string): void{ // newsFeedView와 newsDetailView에서 사용된다.
      this.htmlList.push(htmlString);
    }
  
    protected getHtml(): string{
      const snapshot = this.htmlList.join('');
      this.clearHtmlList();
      return snapshot;
    }
  
    protected setTemplateDate(key: string, value: string): void{
      this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
    }
  
    private clearHtmlList(): void {
      this.htmlList = [];
    }
  
    abstract render(): void; // 자식들에게 반드시 구현하라는 의미의 마킹 (추상메소드)
  }
  