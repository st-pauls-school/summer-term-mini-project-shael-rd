const namespaced = true

const state = {
  userName: '',
  userPassword: ''
}

const mutations = {
  changeUserName (state, entry) {
    state.userName = entry
  },
  changeUserOrganisation (state, entry) {
    state.userOrganisation = entry
  },
  changeUserDescription (state, entry) {
    state.userDescription = entry
  },
  changeUserEmail (state, entry) {
    state.userEmail = entry
  },
  changeUserTelephone (state, entry) {
    state.userEmail = entry
  }
}

const actions = {
  async getUserDetails (context, userId) {
    if (typeof userId !== 'number') {
      throw Error('getUserDetails expects a numeric ID')
    }

    return {
      name: 'Joe King',
      organisation: 'RAL',
      description: 'Head of scientific computing at the RAL. Coffee enthusiast. Hates anime.',
      email: 'joeb666@gmail.com',
      telephone: '07712345678'
    }
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions
}
