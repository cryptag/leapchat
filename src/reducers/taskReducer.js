const initialState = {
  todoLists: [],
  taskMap: {}
};

function taskReducer(state = initialState, action) {

  switch (action.type) {

  // TODO: Accept new encrypted todo list or task from server,
  // decrypt, update state

  // case 'TASK_CREATE_NEW_TASK':
  //   return {
  //     ...state,
  //     taskMap: {
  //       ...state.taskMap,
  //       [action.payload.id]: {
  //         title: '',
  //       }
  //     }
  //   };

  default:
    return state;
  }
}

export default taskReducer;
