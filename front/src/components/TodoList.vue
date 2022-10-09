<template>
  <div>
    <ul>
      <li v-for="(todoItem,index) in todoItems" v-bind:key="todoItem">
        {{todoItem}}
        <button v-on:click="removeTodo(todoItem,index)">delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "TodoList",
  data: function () {
    return {
      todoItems: []
    }
  },
  methods: {
    removeTodo: function(todoItem,index) {
      console.log(todoItem,index);
      localStorage.removeItem(todoItem);
      this.todoItems.splice(index,1);
    }
  },
  created: function() {
    if(localStorage.length > 0){
      for(var i=0; i < localStorage.length; i++){
        this.todoItems.push(localStorage.key(i));
      }
    }
  }
}
</script>

<style scoped>

</style>