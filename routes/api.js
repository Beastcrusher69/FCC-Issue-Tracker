'use strict';
const mongoose    =require('mongoose');
const ObjectId = mongoose.Types.ObjectId ;

const IssueSchema =  mongoose.Schema(
  {
    issue_title : {type : String , required : true},
    issue_text  : {type : String , required : true},
    created_on : Date,
    updated_on : Date,
    created_by : {type : String , required : true},
    assigned_to : String ,
    open : Boolean ,
    status_text : String,
    project : String
  }
)

const Issue = mongoose.model('Issue',IssueSchema);

const ProjectSchema = mongoose.Schema({
  name : {type: String ,required : true} , 
  issues : [ IssueSchema]
})

const Project = mongoose.model('Project', ProjectSchema )

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get( async function (req, res){

       let project = req.params.project;

      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.query ;
      
      const match = await Project.aggregate([
        
        { $match : { name : project}},
        {$unwind : "$issues" },
                        _id != undefined 
                         ?  { $match : { "$issues._id" : ObjectId(_id)}}
                        :{ $match : {}},
                        open != undefined 
                         ?  { $match : { "$issues.open" : open}}
                        :{ $match : {}},
                        issue_title != undefined 
                         ?  { $match : { "$issues.issue_title" : issue_title}}
                        :{ $match : {}},
                        issue_text != undefined 
                         ?  { $match : { "$issues.issue_text" : issue_text}}
                        :{ $match : {}},
                        created_by != undefined 
                         ?  { $match : { "$issues.created_by" : created_by}}
                        :{ $match : {}},
                        assigned_to != undefined 
                         ?  { $match : { "$issues.assigned_to" : assigned_to}}
                        :{ $match : {}},
                        status_text != undefined 
                         ?  { $match : { "$issues.status_text" : status_text}}
                        :{ $match : {}}
                        ])
        let mappedData = match.map((item)=> item.issues)
        res.json(match)
    })
    
    .post(async function (req, res){
      let project = req.params.project;

      let { issue_title
           ,issue_text
           ,created_by
           ,assigned_to
           ,status_text} = req.body ; 

      if(!issue_title || !issue_text || !created_by ){
        res.json({ error: 'required field(s) missing' })
      }

      let newIssue = new Issue({
        issue_title : issue_title || "",
        issue_text  : issue_text || "",
        created_on : new Date(),
        updated_on : new Date(),
        created_by : created_by || "",
        assigned_to : assigned_to || "" ,
        open : true ,
        status_text : status_text || "" ,
        project 
      })

      Issue.create(newIssue);
      
      const projectData = await Project.findOne({name : project});

    
        if(!projectData){
          const projectData = new Project({name : project})
          projectData.issues.push(newIssue);
          projectData.save();
          res.json(newIssue);
        }
        else{
          projectData.issues.push(newIssue);
          projectData.save();
          res.json(newIssue);
          
      }
      
  
    })
    
    .put(async function (req, res){
      let project = req.params.project;

      let { _id
           , issue_title
           ,issue_text
           ,created_by
           ,assigned_to
           ,status_text
          ,open} = req.body ; 

      if(!_id){
        res.json({ error: 'missing _id' });
      }

      if(  !issue_title &&
           !issue_text  &&
           !created_by &&
           !assigned_to &&
           !status_text &&
          !open
      ){
        res.json({ error: 'no update field(s) sent', '_id': _id })
      }

      const projectData = await Project.findOne({name : project});

      if(!projectData){
        res.json({ error: 'could not update', '_id': _id });
      }
      else{

        
        const issueData = await Project.issues.id(_id);
        

        if(!issueData){
          res.json({ error: 'could not update', '_id': _id });
          
        }
        else{
          issueData.issue_title = issue_title ||issueData.issue_title;
          issueData.issue_text = issue_text || issueData.issue_text;
          issueData.created_by = created_by || issueData.created_by;
          issueData.assigned_to = assigned_to || issueData.assigned_to;
          issueData.status_text = status_text || issueData.status_text;
          issueData.open = open ||  issueData.open;
          
          projectData.save();

          res.json({  result: 'successfully updated', '_id': _id });
          
          
        }
        
      }


                              
      
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      let _id = req.body._id;

      const projectData = await Project.findOne({name : project});

      if(!_id){
        res.json({ error: 'missing _id' });
      }
      
       if(!projectData){
        res.json({ error: 'could not delete', '_id': _id });
         console.log('1');
      }
      else{
        
        const issueData = await Project.issues.id(_id);
        

        if(!issueData){
          res.json({ error: 'could not delete', '_id': _id });
         console.log('2');
          
        }
        else{
          console.log(issueData)
          issueData.deleteOne();

          projectData.save();

          res.json({ result: 'successfully deleted', '_id': _id });
          
          
        }
        
      }

      
      
    });

  
    
};
