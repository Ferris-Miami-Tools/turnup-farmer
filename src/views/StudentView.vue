<script setup>
  import {
    addDoc,
    collection,
    doc,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
  } from "firebase/firestore";
  import { onMounted, ref } from "vue";
  import { useToast } from "vue-toastification";

  import { useAuthStore } from "../stores/auth";

  import Card from "../components/shared/Card.vue";
  import FilledButton from "../components/shared/FilledButton.vue";
  import Loading from "../components/shared/Loading.vue";

  const db = getFirestore();
  const auth = useAuthStore();
  const toast = useToast();

  // Loading States
  const checkingIn = ref(false);
  const fetchingClasses = ref(true);
  const refreshingClass = ref(false);
  const updatingChosenName = ref(false);

  // Terminal States
  const checkedInStatus = ref(undefined);
  const notEnrolled = ref(false);

  // Chosen Name
  const chosenName = ref("");

  // Classes
  const currentClass = ref(null);
  const upcomingClasses = ref(null);

  // Functions
  const checkIn = async () => {
    console.info("Student View: checkIn function called");

    try {
      checkingIn.value = true;

      const currentDateTime = getCurrentDateTime();

      if (
        currentClass.value.start > currentDateTime ||
        currentClass.value.end < currentDateTime
      ) {
        currentClass.value = null;
        throw new Error("Class is no longer ongoing.");
      }

      // Search for existing checkin
      const checkinSnap = await getDocs(
        query(
          collection(db, "checkins"),
          where("classID", "==", currentClass.value.classID),
          where("email", "==", auth.user.email),
          where("section", "==", auth.user.section),
          limit(1)
        )
      );

      // Student has already recieved a status
      if (!checkinSnap.empty) {
        const checkinData = checkinSnap.docs[0].data();
        checkedInStatus.value = checkinData.status;
        toast.info(
          `You have been marked ${checkedInStatus.value} for this class. If you think this is a mistake, please contact your instructor.`
        );
        return;
      }

      // Create checkin for the user
      await addDoc(collection(db, "checkins"), {
        classID: currentClass.value.classID,
        email: auth.user.email,
        section: auth.user.section,
        status: "Present",
        timestamp: serverTimestamp(),
      });
      checkedInStatus.value = "Present";
      toast.success("You have successfully checked in.");
    } catch (error) {
      if (error.message === "Class is no longer ongoing.") {
        toast.error(
          "You did not check in before the end of class. Please contact your instructor."
        );
        return;
      }
      toast.error(
        "Unable to check you in. Please contact your instructor if this error persists."
      );
      console.error("Student View: Error checking student in.", error);
    } finally {
      checkingIn.value = false;
    }
  };

  const getCurrentDateTime = () => {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );
  };

  const fetchClasses = async () => {
    console.info("Student View: fetchClasses function called");

    try {
      fetchingClasses.value = true;

      const currentDateTime = getCurrentDateTime();

      const classesSnap = await getDocs(
        query(
          collection(db, "classes"),
          where("section", "==", auth.user.section),
          where("end", ">=", currentDateTime),
          orderBy("end", "asc"),
          limit(3)
        )
      );

      const classes = [];
      classesSnap.forEach(classDoc => {
        const classData = classDoc.data();
        classes.push({
          classID: classDoc.id,
          section: classData.section,
          start: classData.start.toDate(),
          end: classData.end.toDate(),
        });
      });

      if (!classesSnap.empty) {
        if (
          classes[0].start <= currentDateTime &&
          classes[0].end >= currentDateTime
        ) {
          currentClass.value = classes.shift();
        }

        upcomingClasses.value = classes;
        fetchingClasses.value = false;
      }
    } catch (error) {
      toast.error(
        "Unable to fetch your classes. Please contact your instructor if this error persists."
      );
      console.error(`Student View: Error fetching classes`, error);
    } finally {
      fetchingClasses.value = false;
    }
  };

  const refreshClass = async () => {
    console.info("Student View: refreshClass function called");

    refreshingClass.value = true;
    const currentDateTime = getCurrentDateTime();
    if (
      currentDateTime >= upcomingClasses.value[0].start &&
      currentDateTime <= upcomingClasses.value[0].end
    ) {
      currentClass.value = upcomingClasses.value.shift();
    }
    refreshingClass.value = false;
  };

  const updateChosenName = async () => {
    if (updatingChosenName.value) return;

    if (chosenName.value.length === 0) {
      toast.error("Your chosen name cannot be empty.");
      return;
    }

    try {
      updatingChosenName.value = true;
      console.log("updated chosen name", chosenName.value);
      await updateDoc(doc(db, "users", auth.user.email), {
        chosenName: chosenName.value,
      });
      auth.user.chosenName = chosenName.value;
    } catch (error) {
      toast.error(
        "Unable to submit chosen name. Please contact your instructor if this error persists."
      );
      console.error(
        `Student View: Error updating chosen name to: ${chosenName.value}`,
        error
      );
    } finally {
      updatingChosenName.value = false;
    }
  };

  onMounted(async () => {
    if (auth.user.enrolled) {
      fetchClasses();
    } else {
      toast.error(
        "You are not currently enrolled in a class using this system. Please contact your instructor if you believe this to be an error."
      );
      notEnrolled.value = true;
    }
  });
</script>

<template>
  <h2 class="py-4 text-center text-3xl font-semibold">Student View</h2>
  <p v-if="notEnrolled" class="text-center">
    You are not currently enrolled in a class using this system. Please contact
    your instructor if you believe this to be an error.
  </p>
  <div v-else class="grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Current Class Card -->
    <card>
      <h3 class="pb-4 text-center text-xl font-light">Current Class</h3>
      <loading v-if="fetchingClasses" size="large" class="py-4" />
      <div v-else-if="currentClass === null">
        <p>You do not have any classes scheduled for this time.</p>
        <filled-button
          v-if="
            upcomingClasses &&
            upcomingClasses.length !== 0 &&
            upcomingClasses[0].start.toDateString() ===
              new Date().toDateString()
          "
          @click="refreshClass"
          type="button"
          :disabled="refreshingClass"
          >Refresh</filled-button
        >
      </div>
      <div v-else-if="checkedInStatus !== undefined">
        <p>
          You have been marked
          <span class="font-bold text-teal-800 dark:text-teal-50">{{
            checkedInStatus
          }}</span>
          for this class. If you think this is a mistake, please contact your
          instructor.
        </p>
      </div>
      <div v-else-if="currentClass !== null">
        <p>
          {{ auth.user.section }} is from
          {{ currentClass.start.toLocaleTimeString() }} to
          {{ currentClass.end.toLocaleTimeString() }}
        </p>
        <filled-button @click="checkIn" type="button" :disabled="checkingIn"
          >Check in</filled-button
        >
      </div>
    </card>
    <!-- Upcoming Classses Card -->
    <card>
      <h3 class="pb-4 text-center text-xl font-light">
        Upcoming {{ auth.user.section }} Classes
      </h3>
      <loading v-if="fetchingClasses" size="large" class="py-4" />
      <p v-else-if="upcomingClasses === null || upcomingClasses.length === 0">
        You do not have any upcoming classes for {{ auth.user.section }}
      </p>
      <div v-else-if="upcomingClasses !== null">
        <ol>
          <li
            v-for="(aClass, index) in upcomingClasses"
            :key="aClass.classID"
            class="list-none"
          >
            <hr v-if="index !== 0" class="my-4" />
            <p>
              Date:
              {{
                aClass.start.toLocaleDateString([], {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </p>
            <p>
              Time:
              {{
                aClass.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
              to
              {{
                aClass.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </li>
        </ol>
      </div>
    </card>
    <!-- Student Details Card -->
    <card>
      <h3 class="pb-4 text-center text-xl font-light">Student Details</h3>

      <p>
        The name we have on record for you is
        <span class="font-bold text-teal-800 dark:text-teal-50">{{
          auth.user.chosenName === undefined
            ? auth.user.canvasName
            : auth.user.chosenName
        }}</span
        >. Please update this with the form below if this is different from your
        chosen name. Note that this change will only be applied to this
        attendance application, not Canvas/BannerWeb.
      </p>

      <form @submit.prevent="updateChosenName" class="pt-4">
        <label for="chosenName" class="block text-sm font-bold mb-2">
          Chosen Name
        </label>
        <input
          v-model="chosenName"
          type="text"
          id="chosenName"
          class="w-full py-2 px-3 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
        />
        <filled-button :disabled="updatingChosenName">
          Submit Chosen Name
        </filled-button>
      </form>
    </card>
  </div>
</template>
