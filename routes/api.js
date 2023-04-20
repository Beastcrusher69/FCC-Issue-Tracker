'use strict';
const mongoose    =require('mongoose');

const IssueSchema =  mongoose.Schema(
  {
    issue_title : {type : String , required : true},
    issue_text  : {type : String , required : true},
    created_on : Date,
    updated_on : Date,
    created_by : {type : String , required : true},
    assigned_to : String ,
    open : Boolean ,
    status_text : String
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
  
    .get(function (req, res){
      let project = req.params.project;
      
      
    })
    
    .post(function (req, res){
      let project = req.params.project;

      let { issue_title
           ,issue_text
           ,created_by
           ,assigned_to
           ,status_text} = req.body ; 

      let newIssue = new Issue({
        issue_title : issue_title || "",
        issue_text  : issue_text || "",
        created_on : new Date(),
        updated_on : new Date(),
        created_by : created_by || "",
        assigned_to : assigned_to || "" ,
        open : true ,
        status_text : status_text || ""
      })

    
      Project.findOne({name : project}).then(err ,projectData){

        if(err){
          res.send({err : "error"})
        }
        else{
        res.send(projectData);
          
        }
        
      //   if(!projectData){
      //     const projectData = new Project({
      //       name: project,
      //       issues : []
      //     })

      //     projectData.issues.push(newIssue);
      //     projectData.save();
      //     res.json(newIssue);

         
      //   }
      //   else{
      //     projectData.issues.push(newIssue);
      //     projectData.save();
      //     res.json(newIssue);
            
      // }
      }
  
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
