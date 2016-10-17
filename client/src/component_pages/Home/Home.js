//library
import React, { Component } from 'react';
import { connect } from "react-redux";
import homeAction from "./homeAction";
import $ from "jquery";
import style from "./homeStyle.js";

//components
import Navbar from "../../component_utils/Navbar";
import Loading from "../../component_utils/Loading";
import SearchBar from "../../component_utils/SearchBar";
import SpeechDialog from "../../component_utils/SpeechDialog";
import {Card, Media} from "./homeExtras"

var HomeProps;
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'Home';
        this.state = {
            width:0,
        	showLeftNavbar: false,
        	showRightNavbar: false
        }
    }
    componentDidMount() {
        window.speechSynthesis.pause()               
    }
    update(){
        var width = $(window).width();
        this.setState({width: width})
    }
    componentWillMount() {
        this.props.fetchNewsOnce();
        this.props.fetchNewsLoop();
        window.addEventListener("resize", this.update.bind(this))
        this.update.call(this);
    }
    componentWillUnmount() {
    	this.props.stopFetching(); 
        this.props.unmountNews(); //clear the state
    }
    componentWillUpdate(nextProps, nextState) {
        // if()
    }
    _onSearchBarChange(word){
        this.props.filterNews(this.props.news_reducers, word);
    }
  
    render() {
    	const props = HomeProps = this.props;
        const state = this.state;
        style.initWidth(state.width);
        //if no news, show loading
        if("news_reducers" in props && props.news_reducers.length === 0 ){
            return(<div><Navbar /> <Loading /></div>)
        }
        const filtered = props.filteredNews || props.news_reducers
        const newsLoop = !Array.isArray(filtered) ? [] : filtered.sort((a,b) => {
            return b.id - a.id
        })
        .map((n,index) => {
            if(index === 0) return(<Card key={index} news={n}/>)
            return(
                <Media key={index} news={n}/>
            )
        });
        return (
        	<div>
        		<Navbar 
                    LBSymbol={<span className="brand">JPost</span>}
                    showRightMenu={this.state.showRightNavbar}
                    RBAction={() => this.setState({showRightNavbar: !this.state.showRightNavbar})}
                    CollapsedRightMenuContent={
                        <div>
                            <SearchBar onChange={this._onSearchBarChange.bind(this)}/>
                        </div>
                    }
                    />
        		<main className="container" 
                      onClick={() => this.setState({showRightNavbar: false})}
                      style={style.main_container}>
                    
                    {newsLoop}
        		</main>
        	</div>
        );
    }
}

const mapStateToProps = ( ({news}) => news );
const mapDispatchToProps = homeAction;

module.exports = connect(mapStateToProps, mapDispatchToProps)(Home);

// =========
//   LOGIC
// =========
function generateCommand(localComponent){
    return {
        'read *word'(word){
            console.log("read")
            localComponent._readArticle.call(localComponent, word)
        },
        "go back"(){
            $("#backButton").click();
        }
    }
}

const ExtraButton = (props) => {
    
    return(
        <div style={{display: "inline"}}>
            <button onClick={props.onClick1}>read title</button>
            <button onClick={props.onClick2}>read article</button>
        </div>
    )
}

const generateSpeech = (word) => {
    var props = HomeProps;
    var speech;
    if(word === "title"){
        var intro = "the title of this article is: "
        speech = intro + props.article.title + "\n"
    } else if (word === "article"){
        var intro = "the article is: "
        speech = intro + props.article.body
    } 
    return speech;
}
