/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let posts = new Collection({
    id: "posts",
    name: "posts",
    type: "base",
    createRule: "user = @request.auth.id",
    listRule: "",
    viewRule: "",
    fields: [
      {
        name: "created",
        type: "autodate",
        onCreate: true,
      },
      {
        name: "updated",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
      {
        type: "text",
        name: "post",
        required: true,
        max: 100,
        presentable: true,
      },
      {
        name: "user",
        type: "relation",
        collectionId: "_pb_users_auth_",
        required: true,
        cascadeDelete: true
      }
    ]
  })

  app.save(posts)

  let comments = new Collection({
    id: "comments",
    name: "comments",
    type: "base",
    createRule: "user = @request.auth.id",
    listRule: "",
    viewRule: "",
    fields: [
      {
        name: "created",
        type: "autodate",
        onCreate: true,
      },
      {
        name: "updated",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
      {
        type: "text",
        name: "post",
        required: true,
        max: 100,
        presentable: true,
      },
      {
        name: "user",
        type: "relation",
        collectionId: "_pb_users_auth_",
        required: true,
        cascadeDelete: true
      },
      {
        name: "post",
        type: "relation",
        collectionId: "posts",
        required: true,
        cascadeDelete: true
      }
    ]
  })

  app.save(comments)
}, (app) => {
    let comments = app.findCollectionByNameOrId("comments")
    app.delete(comments)
    let posts = app.findCollectionByNameOrId("posts")
    app.delete(posts)
})
