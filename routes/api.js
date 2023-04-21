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
        res.json(mappedData)
      
                      
    
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
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });

  
    
};
